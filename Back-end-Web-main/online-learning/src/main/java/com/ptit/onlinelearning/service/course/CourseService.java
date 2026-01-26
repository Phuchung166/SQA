package com.ptit.onlinelearning.service.course;

import com.ptit.onlinelearning.common.type.CourseStatus;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.component.SendGridSender;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.request.*;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.service.category.ICategoryService;
import com.ptit.onlinelearning.service.coursemodule.ICourseModuleService;
import com.ptit.onlinelearning.utility.SpecificationUtils;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService{

    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final ICategoryService categoryService;
    private final ICourseModuleService courseModuleService;
    private final ModelMapper modelMapper;
    private final SendGridSender sendGridSender;
    private final EventPublisher eventPublisher;

    @Override
    @Transactional
    public Course createCourse(CourseRequest courseRequest, Instructor instructor) {
        if (courseRequest.getCategoryId() != null) {
            Optional<Category> existingCategory = Optional.ofNullable(categoryService.getCategoryById(courseRequest.getCategoryId()));
            if (existingCategory.isEmpty()) {
                throw new DataNotFoundException("Category not found with id " + courseRequest.getCategoryId());
            }
        }

        if(courseRepository.existsByCode(courseRequest.getCode())){
            throw new InvalidParamException("Course code have already existed");
        }
        
        Course course = new Course();
        course.setCode(courseRequest.getCode());
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setThumbnail(courseRequest.getThumbnail());
        course.setPreviewVideo(courseRequest.getPreviewVideo());
        course.setInstructorId(instructor.getId());
        course.setInstructor(instructor);
        course.setCategoryId(courseRequest.getCategoryId());
        course.setLevel(courseRequest.getLevel());
        course.setLanguage(courseRequest.getLanguage());
        course.setPrice(courseRequest.getPrice());
        course.setCurrency(courseRequest.getCurrency());
        course.setStatus(CourseStatus.DRAFT);
        course.setIsFree(courseRequest.getIsFree());
        course.setEnrollmentType(courseRequest.getEnrollmentType());
        if (course.getEnrollmentType() == EnrollmentType.SUBSCRIPTION && course.getExpiredDays() == null){
            throw new InvalidParamException("Expired days must not null be while enrollment type is SUBSCRIPTION");
        }
        
        // Pre-order validation and setup
        if (courseRequest.getIsPreOrder() != null && courseRequest.getIsPreOrder()) {
            // Free courses cannot have pre-order
            if (courseRequest.getIsFree()) {
                throw new InvalidParamException("Free courses cannot have pre-order");
            }
            
            // Validate required pre-order fields
            if (courseRequest.getPreOrderStartDate() == null || 
                courseRequest.getPreOrderEndDate() == null || 
                courseRequest.getPreOrderPrice() == null || 
                courseRequest.getPreOrderTotalSlots() == null) {
                throw new InvalidParamException("Pre-order requires start date, end date, price, and total slots");
            }
            
            // Validate pre-order end date is after start date
            if (!courseRequest.getPreOrderEndDate().isAfter(courseRequest.getPreOrderStartDate())) {
                throw new InvalidParamException("Pre-order end date must be after start date");
            }
            
            // Validate pre-order price is less than regular price
            if (courseRequest.getPreOrderPrice().compareTo(courseRequest.getPrice()) >= 0) {
                throw new InvalidParamException("Pre-order price must be less than regular price");
            }
            
            course.setIsPreOrder(true);
            course.setPreOrderStartDate(courseRequest.getPreOrderStartDate());
            course.setPreOrderEndDate(courseRequest.getPreOrderEndDate());
            course.setPreOrderPrice(courseRequest.getPreOrderPrice());
            course.setPreOrderTotalSlots(courseRequest.getPreOrderTotalSlots());
            course.setPreOrderRemainingSlots(courseRequest.getPreOrderTotalSlots());
        } else {
            course.setIsPreOrder(false);
        }
        
        if (courseRequest.getWhatYouLearn() != null && !courseRequest.getWhatYouLearn().isEmpty()) {
            course.setWhatYouLearn(String.join("\n", courseRequest.getWhatYouLearn()));
        }
        if (courseRequest.getTargetAudiences() != null && !courseRequest.getTargetAudiences().isEmpty()) {
            course.setTargetAudiences(String.join("\n", courseRequest.getTargetAudiences()));
        }
        
        Course savedCourse = courseRepository.save(course);

        // Schedule pre-order expiration if this is a pre-order course
        if (Boolean.TRUE.equals(savedCourse.getIsPreOrder()) && savedCourse.getPreOrderEndDate() != null) {
            eventPublisher.schedulePreOrderExpiration(savedCourse.getId(), savedCourse.getPreOrderEndDate());
        }

        List<CourseRequest.CourseModuleDTO> courseModuleDTOs = courseRequest.getCourseModuleDTOs();
        if (courseModuleDTOs != null && !courseModuleDTOs.isEmpty()) {
            List<CourseModule> courseModules = new ArrayList<>();
            for (CourseRequest.CourseModuleDTO courseModuleDTO : courseModuleDTOs) {
                CourseModule courseModule = courseModuleService.createCourseModule(savedCourse.getId(), courseModuleDTO);
                courseModules.add(courseModule);
            }
            savedCourse.setCourseModules(courseModules);
        }
        
        return savedCourse;
    }

    @Override
    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Course not found: " + id));
    }

    @Override
    public Course updateCourse(Long id, UpdateCourseRequest updateCourseRequest, Instructor instructor) {
        Course existingCourse = courseRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Course not found + "+ id));
        if(!existingCourse.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to update course with id: " + id);
        }

        if(updateCourseRequest.getCode() != null){
            if(courseRepository.existsByCode(updateCourseRequest.getCode())){
                throw new InvalidParamException("Course code have already existed");
            }
            existingCourse.setCode(updateCourseRequest.getCode());
        }
        if (updateCourseRequest.getTitle() != null) existingCourse.setTitle(updateCourseRequest.getTitle());
        if (updateCourseRequest.getDescription() != null) existingCourse.setDescription(updateCourseRequest.getDescription());
        if (updateCourseRequest.getThumbnail() != null) existingCourse.setThumbnail(updateCourseRequest.getThumbnail());
        if (updateCourseRequest.getPreviewVideo() != null) existingCourse.setPreviewVideo(updateCourseRequest.getPreviewVideo());
        if (updateCourseRequest.getCategoryId() != null) existingCourse.setCategoryId(updateCourseRequest.getCategoryId());
        if (updateCourseRequest.getLevel() != null) existingCourse.setLevel(updateCourseRequest.getLevel());
        if (updateCourseRequest.getLanguage() != null) existingCourse.setLanguage(updateCourseRequest.getLanguage());
        if (updateCourseRequest.getPrice() != null) existingCourse.setPrice(updateCourseRequest.getPrice());
        if (updateCourseRequest.getIsFree() != null) existingCourse.setIsFree(updateCourseRequest.getIsFree());
        if (updateCourseRequest.getCurrency() != null) existingCourse.setCurrency(updateCourseRequest.getCurrency());
        if (updateCourseRequest.getWhatYouLearn() != null) existingCourse.setWhatYouLearn(String.join("\n", updateCourseRequest.getWhatYouLearn()));
        if (updateCourseRequest.getTargetAudiences() != null) existingCourse.setTargetAudiences(String.join("\n", updateCourseRequest.getTargetAudiences()));
        if (updateCourseRequest.getEnrollmentType() != null) existingCourse.setEnrollmentType(updateCourseRequest.getEnrollmentType());
        if (existingCourse.getEnrollmentType() == EnrollmentType.SUBSCRIPTION && existingCourse.getExpiredDays() == null){
            throw new InvalidParamException("Expired days must not be null be while enrollment type is SUBSCRIPTION");
        }
        return courseRepository.saveAndFlush(existingCourse);
    }

    @Override
    public void deleteCourse(Long id, User user) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Course not found + "+ id));
        if(!user.hasAdminRole() && !course.getInstructorId().equals(user.getInstructor().getId())){
            throw new AccessDeniedException("Forbidden to delete course with id: " + id);
        }
        courseRepository.delete(course);
    }

    @Override
    public Page<Course> getCourses(int page, int pageSize,
                                   Long categoryId, String search, CourseStatus status,
                                   String sortBy, String sortOrder, EnrollmentType enrollmentType) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        Specification<Course> spec = SpecificationUtils.filterCourses(categoryId, search, status, enrollmentType);
        return courseRepository.findAll(spec, pageable);
    }

    @Override
    public Page<Course> getAllCourseOfInstructorBySlug(int page, int pageSize, String slug, Long categoryId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        Instructor result = instructorRepository.findBySlug(slug)
                .orElseThrow(() -> new DataNotFoundException("Instructor not found with slug: " + slug));
        Long instructorId = result.getId();
        
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Specification<Course> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("instructorId"), instructorId));
            if(categoryId != null){
                predicates.add(criteriaBuilder.equal(root.get("categoryId"), categoryId));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return courseRepository.findAll(spec, pageable);
    }

    @Override
    public Page<Course> getAllCourseOfInstructorByInstructorId(int page, int pageSize, Long categoryId, Long instructorId, Boolean isGrouped) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");

        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Specification<Course> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("instructorId"), instructorId));
             if (isGrouped != null) {
                if (isGrouped) {
                    predicates.add(criteriaBuilder.isNotNull(root.get("courseGroup").get("id")));
                } else {
                    predicates.add(criteriaBuilder.isNull(root.get("courseGroup").get("id")));
                }
            }


            if(categoryId != null){
                predicates.add(criteriaBuilder.equal(root.get("categoryId"), categoryId));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return courseRepository.findAll(spec, pageable);
    }

    @Override
    public Course updateCourseStatus(Long id, UpdateCourseStatusRequest updateCourseStatusRequest)  {
        Course existingCourse = courseRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Course not found + "+ id));
        existingCourse.setStatus(updateCourseStatusRequest.getCourseStatus());
        Course updatedCourse = courseRepository.saveAndFlush(existingCourse);
        Instructor instructor = updatedCourse.getInstructor();
        CourseStatus newStatus = updateCourseStatusRequest.getCourseStatus();
        if(newStatus == CourseStatus.ACTIVE){
            sendGridSender.sendCourseApprovalEmail(
                    instructor.getUser().getEmail(),
                    updatedCourse,
                    instructor,
                    updateCourseStatusRequest.getReason()
            );
        }
        else if(newStatus == CourseStatus.PUBLISHED){
            sendGridSender.sendCourseRejectEmail(
                    instructor.getUser().getEmail(),
                    updatedCourse,
                    instructor,
                    updateCourseStatusRequest.getReason()
            );
        }
        return updatedCourse;
    }

    @Override
    public Course publishCourse(Long id)  {
        Course existingCourse = courseRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Course not found + " + id));
        if (existingCourse.getStatus() != CourseStatus.DRAFT) {
            throw new InvalidParamException("Only courses in DRAFT status can be published.");
        }
        existingCourse.setStatus(CourseStatus.PUBLISHED);
        existingCourse.setPublishedAt(LocalDateTime.now());
        Course updatedCourse = courseRepository.saveAndFlush(existingCourse);
        Instructor instructor = updatedCourse.getInstructor();
        List<User> admins = userRepository.findUsersByRole(RoleName.ADMIN);
        admins.forEach(user -> {
                sendGridSender.sendAdminCourseSubmissionEmail(user.getEmail(), updatedCourse, instructor);
        });
        if (instructor != null && instructor.getUser() != null) {
            sendGridSender.sendInstructorCourseSubmissionEmail(instructor.getUser().getEmail(), updatedCourse, instructor);
        } else {
            throw new DataNotFoundException("Instructor or Instructor's user not found for course id " + id);
        }
        return updatedCourse;
    }

    @Override
    public Integer getInstructorTotalCourses(Long instructorId) {
        if (instructorId == null) {
            return null;
        }
        Long count = courseRepository.countByInstructorId(instructorId);
        return count != null ? count.intValue() : null;
    }

    @Override
    public Page<Course> getPreOrderCourses(int page, int pageSize, String sortBy, String sortOrder) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        
        Specification<Course> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Is pre-order must be true
            predicates.add(criteriaBuilder.isTrue(root.get("isPreOrder")));
            
            // Pre-order end date must be in the future
            predicates.add(criteriaBuilder.greaterThan(root.get("preOrderEndDate"), LocalDateTime.now()));
            
            // Course status must be ACTIVE
//            predicates.add(criteriaBuilder.equal(root.get("status"), CourseStatus.ACTIVE));
            
            // Pre-order remaining slots must be greater than 0
            predicates.add(criteriaBuilder.greaterThan(root.get("preOrderRemainingSlots"), 0));
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return courseRepository.findAll(spec, pageable);
    }
}
