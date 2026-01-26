package com.ptit.onlinelearning.consumer;

import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.common.type.PreOrderStatus;
import com.ptit.onlinelearning.config.RabbitMQConfig;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.model.PreOrderEnrollment;
import com.ptit.onlinelearning.repository.CourseGroupRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.PreOrderEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreOrderGroupExpireConsumer {

    private final CourseGroupRepository courseGroupRepository;
    private final PreOrderEnrollmentRepository preOrderEnrollmentRepository;
    private final EnrollmentRepository enrollmentRepository;

    @RabbitListener(queues = RabbitMQConfig.PREORDER_GROUP_EXPIRE_QUEUE)
    @Transactional
    public void handlePreOrderGroupExpire(Long courseGroupId) {
        log.info("Processing pre-order group expiration for course group ID: {}", courseGroupId);
        
        Optional<CourseGroup> optionalCourseGroup = courseGroupRepository.findById(courseGroupId);
        if (optionalCourseGroup.isEmpty()) {
            log.warn("Course group with ID {} not found", courseGroupId);
            return;
        }
        
        CourseGroup courseGroup = optionalCourseGroup.get();
        
        if (Boolean.TRUE.equals(courseGroup.getIsPreOrder()) &&
            courseGroup.getBundlePreorderEndDate() != null && 
            !courseGroup.getBundlePreorderEndDate().isAfter(LocalDateTime.now())) {
            
            // Step 1: Update course group pre-order status
            courseGroup.setIsPreOrder(false);
            courseGroup.setPreOrderPrice(null);
            courseGroupRepository.save(courseGroup);
            
            log.info("Course group {} pre-order period has ended. Pre-order status updated.", 
                    courseGroup.getTitle());
            
            // Step 2: Convert all PAID pre-order enrollments to actual enrollments
            convertPreOrderEnrollmentsToEnrollments(courseGroup);
            
        } else {
            log.info("Course group {} pre-order status is already updated or not expired. Current status: isPreOrder={}, endDate={}, now={}", 
                    courseGroup.getTitle(), courseGroup.getIsPreOrder(), 
                    courseGroup.getBundlePreorderEndDate(), LocalDateTime.now());
        }
    }
    
    private void convertPreOrderEnrollmentsToEnrollments(CourseGroup courseGroup) {
        
        List<PreOrderEnrollment> paidPreOrders = preOrderEnrollmentRepository
                .findByCourseGroupIdAndStatus(courseGroup.getId(), PreOrderStatus.PAID);
        
        if (paidPreOrders.isEmpty()) {
            log.info("No PAID pre-order enrollments found for course group {}", courseGroup.getTitle());
            return;
        }
        
        log.info("Found {} PAID pre-order enrollments to convert for course group {}", 
                paidPreOrders.size(), courseGroup.getTitle());
        
        List<Enrollment> newEnrollments = new ArrayList<>();
        List<PreOrderEnrollment> updatedPreOrders = new ArrayList<>();
        
        for (PreOrderEnrollment preOrder : paidPreOrders) {
            // Create enrollments for all courses in the course group
            List<Course> courses = courseGroup.getCourses();
            
            if (courses == null || courses.isEmpty()) {
                log.warn("Course group {} has no courses. Skipping conversion for pre-order {}",
                        courseGroup.getId(), preOrder.getId());
                continue;
            }
            
            boolean allEnrolled = true;
            
            for (Course course : courses) {
                // Check if enrollment already exists
                boolean alreadyEnrolled = enrollmentRepository.existsByUserIdAndCourseId(
                        preOrder.getUser().getId(), course.getId());
                
                if (alreadyEnrolled) {
                    log.warn("User {} already enrolled in course {}. Skipping.", 
                            preOrder.getUser().getId(), course.getId());
                    continue;
                }
                
                allEnrolled = false;
                
                // Create new enrollment
                Enrollment enrollment = new Enrollment();
                enrollment.setUser(preOrder.getUser());
                enrollment.setCourse(course);
                enrollment.setCourseGroup(courseGroup);
                enrollment.setEnrollmentDate(LocalDateTime.now());
                enrollment.setPreOrderEnrollment(preOrder);
                
                // Calculate end date if course has subscription type
                if (course.getEnrollmentType() == EnrollmentType.SUBSCRIPTION 
                        && course.getExpiredDays() != null) {
                    enrollment.setEndDate(LocalDateTime.now().plusDays(course.getExpiredDays()));
                }
                
                newEnrollments.add(enrollment);
                
                log.info("Converted pre-order {} to enrollment for user {} on course {} in group {}", 
                        preOrder.getId(), preOrder.getUser().getId(), course.getCode(), courseGroup.getTitle());
            }
            
            // Update pre-order status to CONVERTED only if at least one enrollment was created
            if (!allEnrolled) {
                preOrder.setStatus(PreOrderStatus.CONVERTED);
                updatedPreOrders.add(preOrder);
            }
        }
        
        // Save all enrollments and update pre-order statuses
        if (!newEnrollments.isEmpty()) {
            enrollmentRepository.saveAll(newEnrollments);
            preOrderEnrollmentRepository.saveAll(updatedPreOrders);
            
            log.info("Successfully converted {} pre-order enrollments to {} actual enrollments for course group {}", 
                    updatedPreOrders.size(), newEnrollments.size(), courseGroup.getTitle());
        }
    }
}

