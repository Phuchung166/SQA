package com.ptit.onlinelearning.service.enrollment;

import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.request.CreateEnrollment;
import com.ptit.onlinelearning.request.EnrollmentRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.CartItemRepository;
import com.ptit.onlinelearning.repository.CourseGroupRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.PreOrderEnrollmentRepository;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseGroupResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.lessonprogress.ILessonProgressService;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService implements IEnrollmentService{

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final CartItemRepository cartItemRepository;
    private final ILessonProgressService lessonProgressService;
    private final PreOrderEnrollmentRepository preOrderEnrollmentRepository;

    @Override
    @Transactional
    public Enrollment createEnrollment(User user, EnrollmentRequest enrollmentRequest) {
        Course course = courseRepository.findById(enrollmentRequest.getCourseId()).orElseThrow(()->new
                DataNotFoundException("Course not found with id " + enrollmentRequest.getCourseId()));
        if(!course.getIsFree()){
            throw new InvalidParamException("course is not free, cannot enroll directly");
        }
        if(enrollmentRepository.existsByUserIdAndCourseId(user.getId(), enrollmentRequest.getCourseId())) {
            throw new InvalidParamException("The course has already been enrolled");
        }
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        if(course.getEnrollmentType() == EnrollmentType.SUBSCRIPTION){
            enrollment.setEndDate(enrollment.getCreatedAt().plusDays(course.getExpiredDays()));
        }
        return enrollmentRepository.save(enrollment);
    }

    @Override
    public List<Enrollment> createEnrollment(User user, Long courseGroupId) {
        CourseGroup courseGroup = courseGroupRepository.findById(courseGroupId).orElseThrow(()->new DataNotFoundException("Course group not found with id " + courseGroupId));
        if(enrollmentRepository.existsByUserIdAndCourseGroupId(user.getId(), courseGroupId)) {
            throw new InvalidParamException("The course group has already been enrolled");
        }
        if(courseGroup.getCourses() == null || courseGroup.getCourses().isEmpty()) {
            throw new InvalidParamException("The course group has no courses");
        }

        boolean isValid = courseGroup.getCourses().stream().allMatch(Course::getIsFree);
        if(!isValid){
            throw new InvalidParamException("Some courses in the course group are not free, cannot enroll directly");
        }
        List<Enrollment> enrollments = new ArrayList<>();
        courseGroup.getCourses().forEach(course -> {
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(user);
            enrollment.setCourse(course);
            enrollment.setEnrollmentDate(LocalDateTime.now());
            if (course.getEnrollmentType() == EnrollmentType.SUBSCRIPTION) {
                enrollment.setEndDate(enrollment.getCreatedAt().plusDays(course.getExpiredDays()));
            }
            enrollment.setCourseGroup(courseGroup);
            enrollments.add(enrollment);
        });
        enrollmentRepository.saveAll(enrollments);
        return enrollments;
    }

    @Override
    public Page<Enrollment> getEnrollments(int page, int pageSize, String sortBy, String sortOrder, String search, Long courseId, Long userId) {
        Specification<Enrollment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if(userId != null){
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if(courseId != null){
                predicates.add(cb.equal(root.get("courseId"), courseId));
            }
            return getSearchPredicate(search, root, cb, predicates);
        };
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return enrollmentRepository.findAll(spec, pageable);
    }

    @Override
    public PageableResponse<EnrollmentResponse> getEnrollmentsByUserId(int page, int pageSize, String sortBy, String sortOrder, String search, Long userId) {
        Specification<Enrollment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("userId"), userId));
            return getSearchPredicate(search, root, cb, predicates);
        };
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        Page<Enrollment> enrollmentPage = enrollmentRepository.findAll(spec, pageable);

//        List<EnrollmentResponse> data = enrollmentPage.getContent()
//                .stream()
//                .map(enrollment -> EnrollmentResponse.fromEntity(
//                        enrollment,
//                        lessonProgressService.calculateUserCourseProgress(userId, enrollment.getCourseId(), enrollment.getId())
//                ))
//                .toList();
//        return PageableResponse.<EnrollmentResponse>builder()
//                .currentPage(enrollmentPage.getNumber() + 1)
//                .totalPages(enrollmentPage.getTotalPages())
//                .totalElements(enrollmentPage.getTotalElements())
//                .pageSize(enrollmentPage.getSize())
//                .hasNext(enrollmentPage.hasNext())
//                .hasPrevious(enrollmentPage.hasPrevious())
//                .data(data)
//                .build();
        return null;
    }

    @Override
    public Enrollment getEnrollmentById(Long id, User user) {
        Enrollment enrollment = enrollmentRepository.findById(id).orElseThrow(()->new DataNotFoundException("Enrollment not found with id " + id));
        if(!enrollment.getUser().getId().equals(user.getId())){
            throw new AccessDeniedException("Access denied to see enrollment id: " + enrollment.getId());
        }
        return enrollment;
    }

    @Override
    public void deleteEnrollment(Long id, User user) {
        Enrollment enrollment = enrollmentRepository.findById(id).orElseThrow(()->new DataNotFoundException("Enrollment not found with id " + id));
        if(!enrollment.getUser().getId().equals(user.getId())){
            throw new AccessDeniedException("Access denied to delete enrollment id: " + enrollment.getId());
        }
        enrollmentRepository.delete(enrollment);
    }

    @Override
    public PageableResponse<EnrollmentCourseResponse> getAllCoursesEnrolledByUser(int page, int pageSize, String sortBy,
                                                                                  String sortOrder, String search, Long userId) {
        int zeroBasedPage = Math.max(0, page - 1);
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortField = (sortBy == null || sortBy.trim().isEmpty()) ? "createdAt" : sortBy;
        Sort sort = Sort.by(direction, sortField);

        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, sort);
        Page<EnrollmentCourseResponse> enrollmentCourseResponses = enrollmentRepository.getAllEnrollmentCourseByUserId(userId, pageable);
        List<EnrollmentCourseResponse> data = enrollmentCourseResponses.getContent()
                .stream()
                .peek(enrollmentCourseResponse -> {
                    Double progress = lessonProgressService.calculateUserCourseProgress(
                            userId, enrollmentCourseResponse.getCourseId(), enrollmentCourseResponse.getId());
                    enrollmentCourseResponse.setTotalProgress(progress);
                })
                .toList();
        return PageableResponse.<EnrollmentCourseResponse>builder()
                .currentPage(enrollmentCourseResponses.getNumber() + 1)
                .totalPages(enrollmentCourseResponses.getTotalPages())
                .totalElements(enrollmentCourseResponses.getTotalElements())
                .pageSize(enrollmentCourseResponses.getSize())
                .hasNext(enrollmentCourseResponses.hasNext())
                .hasPrevious(enrollmentCourseResponses.hasPrevious())
                .data(data)
                .build();
    }

    @Override
    public PageableResponse<EnrollmentCourseResponse> getAllCourseGroupsEnrolledByUser(int page, int pageSize,
                                                                                       String search, Long userId) {
        int zeroBasedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize);
        Page<EnrollmentCourseResponse> enrollmentCourseGroupResponses = enrollmentRepository.getAllEnrollmentCourseGroupByUserId(userId, pageable);
        List<EnrollmentCourseResponse> data = enrollmentCourseGroupResponses.getContent()
                .stream()
                .peek(enrollmentCourseResponse -> {
                    Double progress = lessonProgressService.caculateUserCourseGroupProgress(userId, enrollmentCourseResponse.getCourseId());
                    enrollmentCourseResponse.setTotalProgress(progress);
                }).toList();
        return PageableResponse.<EnrollmentCourseResponse>builder()
                .currentPage(enrollmentCourseGroupResponses.getNumber() + 1)
                .totalPages(enrollmentCourseGroupResponses.getTotalPages())
                .totalElements(enrollmentCourseGroupResponses.getTotalElements())
                .pageSize(enrollmentCourseGroupResponses.getSize())
                .hasNext(enrollmentCourseGroupResponses.hasNext())
                .hasPrevious(enrollmentCourseGroupResponses.hasPrevious())
                .data(data)
                .build();
    }

    @Override
    public List<Enrollment> studentEnroll(List<CreateEnrollment> createEnrollments) {
        List<Enrollment> enrollmentList = createEnrollments.stream()
                .map(item -> Enrollment.builder()
                        .enrollmentDate(LocalDateTime.now())
                        .course(item.getCourse())
                        .order(item.getOrder())
                        .user(item.getUser())
                        .courseGroup(item.getCourseGroup())
                        .build())
                .toList();
        enrollmentRepository.saveAll(enrollmentList);
        return enrollmentList;
    }


    @Override
    public EnrollmentCourseGroupResponse getEnrollmentCourseGroupDetail(Long courseGroupId, Long userId) {
        if (!enrollmentRepository.existsByUserIdAndCourseGroupId(userId, courseGroupId)) {
            throw new DataNotFoundException("Enrollment not found for user and course group");
        }

        CourseGroup courseGroup = courseGroupRepository.findCourseGroupById(courseGroupId)
                .orElseThrow(() -> new DataNotFoundException("Course group not found with id: " + courseGroupId));

        List<Enrollment> enrollments = enrollmentRepository.findAllByUserIdAndCourseGroupId(userId, courseGroupId);

        List<EnrollmentCourseResponse> enrollmentCourseResponses = enrollments.stream()
                .filter(enrollment -> enrollment.getCourse() != null)
                .map(enrollment -> {
                    Course course = enrollment.getCourse();
                    
                    Double progress = lessonProgressService.calculateUserCourseProgress(
                            userId, course.getId(), enrollment.getId());
                    
                    return EnrollmentCourseResponse.builder()
                            .id(enrollment.getId())
                            .totalProgress(progress)
                            .enrollmentDate(enrollment.getEnrollmentDate())
                            .completedAt(enrollment.getCompletedAt())
                            .lastAccessed(enrollment.getLastAccessed())
                            .courseId(course.getId())
                            .title(course.getTitle())
                            .thumbnail(course.getThumbnail())
                            .slug(course.getSlug())
                            .courseType(CourseType.STANDALONE)
                            .build();
                })
                .collect(Collectors.toList());

        return EnrollmentCourseGroupResponse.builder()
                .courseGroupId(courseGroup.getId())
                .courseGroupTitle(courseGroup.getTitle())
                .courseGroupDescription(courseGroup.getDescription())
                .courseGroupThumbnail(courseGroup.getThumbnail())
                .whatYouLearn(courseGroup.getWhatYouLearn())
                .enrollmentType(courseGroup.getEnrollmentType())
                .enrollmentCourseResponses(enrollmentCourseResponses)
                .build();
    }

    @Override
    public Map<String, Object> checkEnrollmentCourse(Long courseId, CourseType courseType, Long userId, Boolean checkPreOrder) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("courseId", courseId);
        result.put("courseType", courseType);
        
        if (courseType == CourseType.STANDALONE) {
            boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
            result.put("isEnrolled", isEnrolled);
            
            if (isEnrolled) {
                Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
                enrollment.ifPresent(e -> result.put("enrollmentId", e.getId()));
            }
            
            // Check pre-order enrollment if checkPreOrder is true
            if (Boolean.TRUE.equals(checkPreOrder)) {
                boolean hasPreOrder = preOrderEnrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
                result.put("hasPreOrder", hasPreOrder);
            }
        } else if (courseType == CourseType.GROUP) {
            boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseGroupId(userId, courseId);
            result.put("isEnrolled", isEnrolled);
        } else {
            result.put("isEnrolled", false);
        }
        
        return result;
    }


    private Predicate getSearchPredicate(String search, Root<Enrollment> root, CriteriaBuilder cb, List<Predicate> predicates) {
        if(search != null && !search.isEmpty()){
            Predicate courseLike = cb.like(cb.lower(root.get("course").get("title")), "%" + search.toLowerCase() + "%");
            Predicate accountNameLike = cb.like(cb.lower(root.get("user").get("accountName")), "%" + search.toLowerCase() + "%");
            Predicate emailLike = cb.like(cb.lower(root.get("user").get("email")), "%" + search.toLowerCase() + "%");
            predicates.add(cb.or(courseLike, accountNameLike, emailLike));
        }
        return  cb.and(predicates.toArray(new Predicate[0]));
    }
}
