package com.ptit.onlinelearning.service.coursegroup;


import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.request.CreateCourseGroupRequest;
import com.ptit.onlinelearning.request.UpdateCourseGroupRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.repository.CourseGroupRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseGroupService implements ICourseGroupService {

    private final CourseGroupRepository courseGroupRepository;
    private final CourseRepository courseRepository;
    private final EventPublisher eventPublisher;

    @Override
    @Transactional
    public CourseGroup createCourseGroup(CreateCourseGroupRequest createCourseGroupRequest, Long instructorId) {

        List<Course> courses = courseRepository.findAllByCodeIn(createCourseGroupRequest.getCourseCodes());
        if (courses == null || courses.isEmpty()){
            throw new InvalidParamException("list course codes is invalid");
        }
        
        boolean checkCourseGroupExist = courses.stream().allMatch(course -> course.getCourseGroup() != null);
        if (checkCourseGroupExist){
            throw new InvalidParamException("one or more courses already belong to a course group");
        }
        
        // Check if any course is in pre-order status
        boolean hasPreOrderCourse = courses.stream().anyMatch(course -> 
            Boolean.TRUE.equals(course.getIsPreOrder()));
        if (hasPreOrderCourse) {
            throw new InvalidParamException("courses with active pre-order cannot be added to a course group");
        }

        if(!checkSameCategoryAndEnrollmentType(courses, createCourseGroupRequest.getCurrency(), createCourseGroupRequest.getEnrollmentType())){
            throw new InvalidParamException("courses must have the same category and enrollment type and currency");
        }
        if(!checkSameInstructor(courses, instructorId)){
            throw new InvalidParamException("courses must belong to the same instructor");
        }

        boolean allFree = courses.stream().allMatch(Course::getIsFree);
        boolean allPaid = courses.stream().noneMatch(Course::getIsFree);

        if (!(allFree || allPaid)) {
            throw new InvalidParamException("all courses must have the same is_free value (either all free or all paid)");
        }

        BigDecimal price = courses.stream().map(Course::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (price.compareTo(createCourseGroupRequest.getPrice()) > 0){
            throw new InvalidParamException("price of course group is calculated incorrectly");
        }
        
        // Pre-order validation and setup
        CourseGroup.CourseGroupBuilder courseGroupBuilder = CourseGroup.builder()
                .title(createCourseGroupRequest.getTitle())
                .description(createCourseGroupRequest.getDescription())
                .thumbnail(createCourseGroupRequest.getThumbnail())
                .price(createCourseGroupRequest.getPrice())
                .currency(createCourseGroupRequest.getCurrency())
                .enrollmentType(createCourseGroupRequest.getEnrollmentType())
                .whatYouLearn(createCourseGroupRequest.getWhatYouLearn());
        
        if (Boolean.TRUE.equals(createCourseGroupRequest.getIsPreOrder())) {
            // Free course groups cannot have pre-order
            if (allFree) {
                throw new InvalidParamException("Free course groups cannot have pre-order");
            }
            
            // Validate required pre-order fields
            if (createCourseGroupRequest.getBundlePreorderStartDate() == null || 
                createCourseGroupRequest.getBundlePreorderEndDate() == null || 
                createCourseGroupRequest.getPreOrderPrice() == null || 
                createCourseGroupRequest.getBundleTotalSlots() == null) {
                throw new InvalidParamException("Pre-order requires start date, end date, price, and total slots");
            }
            
            // Validate pre-order end date is after start date
            if (!createCourseGroupRequest.getBundlePreorderEndDate()
                    .isAfter(createCourseGroupRequest.getBundlePreorderStartDate())) {
                throw new InvalidParamException("Pre-order end date must be after start date");
            }
            
            // Validate pre-order price is less than regular price
            BigDecimal regularPrice = createCourseGroupRequest.getPrice();
            
            if (createCourseGroupRequest.getPreOrderPrice().compareTo(regularPrice) >= 0) {
                throw new InvalidParamException("Pre-order price must be less than regular price");
            }
            
            courseGroupBuilder
                .isPreOrder(true)
                .bundlePreorderStartDate(createCourseGroupRequest.getBundlePreorderStartDate())
                .bundlePreorderEndDate(createCourseGroupRequest.getBundlePreorderEndDate())
                .preOrderPrice(createCourseGroupRequest.getPreOrderPrice())
                .bundleTotalSlots(createCourseGroupRequest.getBundleTotalSlots())
                .bundleRemainingSlots(createCourseGroupRequest.getBundleTotalSlots());
        } else {
            courseGroupBuilder.isPreOrder(false);
        }
        
        CourseGroup courseGroup = courseGroupBuilder.build();
        courses.forEach(course -> course.setCourseGroup(courseGroup));
        courseGroup.setCourses(courses);
        CourseGroup savedCourseGroup = courseGroupRepository.save(courseGroup);
        
        // Schedule pre-order expiration if this is a pre-order course group
        if (Boolean.TRUE.equals(savedCourseGroup.getIsPreOrder()) && 
            savedCourseGroup.getBundlePreorderEndDate() != null) {
            eventPublisher.schedulePreOrderGroupExpiration(
                savedCourseGroup.getId(), 
                savedCourseGroup.getBundlePreorderEndDate()
            );
        }
        
        return savedCourseGroup;
    }

    @Override
    @Transactional
    public CourseGroup updateCourseGroup(Long id, UpdateCourseGroupRequest updateCourseGroupRequest, Long instructorId) {
        Optional<CourseGroup> courseGroup = courseGroupRepository.findById(id);
        if (courseGroup.isEmpty()){
            throw new DataNotFoundException("course group not found with id: " + id);
        }
        CourseGroup courseGroupToUpdate = courseGroup.get();
        if(updateCourseGroupRequest.getTitle() != null ){
            courseGroupToUpdate.setTitle(updateCourseGroupRequest.getTitle());
        }
        if(updateCourseGroupRequest.getDescription() != null ){
            courseGroupToUpdate.setDescription(updateCourseGroupRequest.getDescription());
        }
        if (updateCourseGroupRequest.getThumbnail() != null ){
            courseGroupToUpdate.setThumbnail(updateCourseGroupRequest.getThumbnail());
        }
        if (updateCourseGroupRequest.getCustomPrice() != null ){
            courseGroupToUpdate.setCustomPrice(updateCourseGroupRequest.getCustomPrice());
        }
        if (updateCourseGroupRequest.getWhatYouLearn() != null ){
            courseGroupToUpdate.setWhatYouLearn(updateCourseGroupRequest.getWhatYouLearn());
        }
        if (updateCourseGroupRequest.getCourseCodes() != null && ! updateCourseGroupRequest.getCourseCodes().isEmpty()){
            List<Course> listCourse = courseRepository.findAllByCodeIn(updateCourseGroupRequest.getCourseCodes());
            if (listCourse.isEmpty() ){
                throw new InvalidParamException("list course codes is invalid");
            }
            boolean checkCourseGroupExist = listCourse.stream().anyMatch(course -> course.getCourseGroup() != null);
            if (checkCourseGroupExist){
                throw new InvalidParamException("one or more courses already belong to a course group");
            }

            if(!checkSameCategoryAndEnrollmentType(listCourse, courseGroupToUpdate.getCurrency(), courseGroupToUpdate.getEnrollmentType())){
                throw new InvalidParamException("courses must have the same category and enrollment type and currency");
            }
            if(!checkSameInstructor(listCourse, instructorId)){
                throw new InvalidParamException("courses must belong to the same instructor");
            }

            BigDecimal updatePrice = listCourse.stream().map(Course::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            courseGroupToUpdate.setPrice(updatePrice.add(courseGroupToUpdate.getPrice()));
            listCourse.forEach(course -> course.setCourseGroup(courseGroupToUpdate));
            courseGroupToUpdate.setCourses(listCourse);
        }
        if( updateCourseGroupRequest.getRemovedCourseCodes() != null && ! updateCourseGroupRequest.getRemovedCourseCodes().isEmpty() ){
            List<Course> removedCourses = courseRepository.findAllByCodeIn(updateCourseGroupRequest.getRemovedCourseCodes());
            if (removedCourses.isEmpty()){
                throw  new InvalidParamException("list course codes is invalid");
            }
            BigDecimal updatedPrice = courseGroupToUpdate.getPrice().subtract(
                    removedCourses.stream().map(Course::getPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
            );
            courseGroupToUpdate.setPrice(updatedPrice);

            removedCourses.forEach(course -> course.setCourseGroup(null));
            courseRepository.saveAll(removedCourses);
            courseGroupToUpdate.getCourses().removeAll(removedCourses);

        }
        return courseGroupRepository.saveAndFlush(courseGroupToUpdate);
    }

    @Override
    public CourseGroup getCourseGroupById(Long id) {
        Optional<CourseGroup> courseGroup = courseGroupRepository.findCourseGroupById(id);
        if (courseGroup.isEmpty()){
            throw new DataNotFoundException("course group not found with id: " + id);
        }
        return courseGroup.get();
    }


    public Boolean checkSameCategoryAndEnrollmentType(List<Course> courseList, Currency currency, EnrollmentType enrollmentType){
        Long firstCategoryId = courseList.getFirst().getCategory().getId();
        return courseList.stream().allMatch(course ->
                Objects.equals(course.getCategoryId(), firstCategoryId)
                        && Objects.equals(course.getEnrollmentType(), enrollmentType)
                        && Objects.equals(course.getCurrency(), currency)

        );
    }

    public Boolean checkSameInstructor(List<Course> courseList, Long instructorId){
        return courseList.stream().allMatch(course ->
                Objects.equals(course.getInstructorId(), instructorId)
        );
    }

    @Override
    public Page<CourseGroup> getAllCourseGroupsOfInstructor(int page, int pageSize, String search, EnrollmentType enrollmentType, Long instructorId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Specification<CourseGroup> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            Join<CourseGroup, Course> coursesJoin = root.join("courses");
            predicates.add(criteriaBuilder.equal(coursesJoin.get("instructorId"), instructorId));
            
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    searchPattern
                );
                Predicate descriptionPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), 
                    searchPattern
                );
                predicates.add(criteriaBuilder.or(titlePredicate, descriptionPredicate));
            }
            
            if (enrollmentType != null) {
                predicates.add(criteriaBuilder.equal(root.get("enrollmentType"), enrollmentType));
            }
            
            assert query != null;
            query.distinct(true);
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return courseGroupRepository.findAll(spec, pageable);
    }

    @Override
    public Page<CourseGroup> getAllCourseGroups(int page, int pageSize, String search, EnrollmentType enrollmentType, Long categoryId, String sortBy, String sortOrder) {
        List<String> allowedSortFields = List.of("createdAt", "updatedAt", "title", "price");
        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "createdAt";
        }
        
        Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Specification<CourseGroup> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Only get non-pre-order course groups
            predicates.add(criteriaBuilder.or(
                criteriaBuilder.isFalse(root.get("isPreOrder")),
                criteriaBuilder.isNull(root.get("isPreOrder"))
            ));
            
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    searchPattern
                );
                Predicate descriptionPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), 
                    searchPattern
                );
                predicates.add(criteriaBuilder.or(titlePredicate, descriptionPredicate));
            }
            
            if (enrollmentType != null) {
                predicates.add(criteriaBuilder.equal(root.get("enrollmentType"), enrollmentType));
            }
            
            if (categoryId != null) {
                Join<CourseGroup, Course> coursesJoin = root.join("courses");
                predicates.add(criteriaBuilder.equal(coursesJoin.get("categoryId"), categoryId));
                assert query != null;
                query.distinct(true);
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return courseGroupRepository.findAll(spec, pageable);
    }

    @Override
    public Page<CourseGroup> getPreOrderCourseGroups(int page, int pageSize, String sortBy, String sortOrder) {
        List<String> allowedSortFields = List.of("createdAt", "updatedAt", "title", "preOrderPrice");
        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "createdAt";
        }
        
        Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        
        Specification<CourseGroup> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Is pre-order must be true
            predicates.add(criteriaBuilder.isTrue(root.get("isPreOrder")));
            
            // Pre-order end date must be in the future (still active)
            predicates.add(criteriaBuilder.greaterThan(
                root.get("bundlePreorderEndDate"), 
                java.time.LocalDateTime.now()
            ));
            
            // Pre-order remaining slots must be greater than 0
            predicates.add(criteriaBuilder.greaterThan(root.get("bundleRemainingSlots"), 0));
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return courseGroupRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public void deleteCourseGroup(Long id, Long instructorId) {
        Optional<CourseGroup> courseGroupOpt = courseGroupRepository.findCourseGroupById(id);
        if (courseGroupOpt.isEmpty()) {
            throw new DataNotFoundException("Course group not found with id: " + id);
        }
        CourseGroup courseGroup = courseGroupOpt.get();
        
        if (courseGroup.getCourses() == null || courseGroup.getCourses().isEmpty()) {
            courseGroupRepository.delete(courseGroup);
        }
        boolean isOwner = courseGroup.getCourses().stream()
                .allMatch(course -> Objects.equals(course.getInstructorId(), instructorId));
        
        if (!isOwner) {
            throw new InvalidParamException("You don't have permission to delete this course group");
        }
        
        List<Course> courses = new ArrayList<>(courseGroup.getCourses());
        courses.forEach(course -> course.setCourseGroup(null));
        courseGroup.getCourses().clear();
        courseRepository.saveAll(courses);
        courseGroupRepository.delete(courseGroup);
    }
}
