package com.ptit.onlinelearning.service.cartitem;

import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.request.CartItemRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.CartItem;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.repository.CartItemRepository;
import com.ptit.onlinelearning.repository.CourseGroupRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.response.order.CartItemResponse;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartItemService implements ICartItemService {

    private final CartItemRepository cartItemRepository;
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InstructorRepository instructorRepository;

    @Override
    public Page<CartItem> getCartItems(int page, int pageSize, String sortBy, String sortOrder, Long userId, Long courseId) {
        Specification<CartItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if(userId != null){
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if(courseId != null){
                predicates.add(cb.equal(root.get("courseId"), courseId));
            }
            return  cb.and(predicates.toArray(new Predicate[0]));
        };
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return cartItemRepository.findAll(spec, pageable);
    }

    @Override
    public Page<CartItemResponse> getCartItemsByUserId(int page, int pageSize, String sortBy, String sortOrder, @NotNull Long userId) {
//        Specification<CartItem> spec = (root, query, cb) -> {
//            List<Predicate> predicates = new ArrayList<>();
//            predicates.add(cb.equal(root.get("userId"), userId));
//            return  cb.and(predicates.toArray(new Predicate[0]));
//        };
//        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
//        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
//        return cartItemRepository.findAll(spec, pageable);
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortField = (sortBy == null || sortBy.trim().isEmpty()) ? "createdAt" : sortBy;
        Sort sort = Sort.by(direction, sortField);

        Pageable pageable = PageRequest.of(page, pageSize, sort);
        return cartItemRepository.getAllCartItemsByUserId(userId, pageable);
    }

    @Override
    public CartItem getCartItemById(Long id, User user) {
        CartItem cartItem = cartItemRepository.findById(id).orElseThrow(()-> new DataNotFoundException("CartItem not found with id: " + id));
        if(!cartItem.getUser().getId().equals(user.getId())){
            throw new AccessDeniedException("Access denied to see cart item");
        }
        return cartItem;
    }

    @Override
    @Transactional
    public CartItem createCartItem(User user, CartItemRequest request) {

        // ===== CASE 1: ADD SINGLE COURSE =====
        if (request.getCourseId() != null) {

            Long courseId = request.getCourseId();

            if (cartItemRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
                throw new InvalidParamException("The course has already been added to cart");
            }

            if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
                throw new InvalidParamException("The course has already been enrolled");
            }

            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() ->
                            new DataNotFoundException("Course not found with id: " + courseId));

            // Check own course
            if (course.getInstructorId() != null) {
                Instructor instructor = instructorRepository
                        .findById(course.getInstructorId())
                        .orElseThrow(() -> new DataNotFoundException("Instructor not found"));

                if (instructor.getUserId().equals(user.getId())) {
                    throw new InvalidParamException("You cannot add your own course to cart");
                }
            }

            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setCourse(course);

            return cartItemRepository.save(cartItem);
        }

        // ===== CASE 2: ADD COURSE GROUP =====
        if (request.getCourseGroupId() != null) {

            Long groupId = request.getCourseGroupId();

            CourseGroup courseGroup = courseGroupRepository.findCourseGroupById(groupId)
                    .orElseThrow(() ->
                            new DataNotFoundException("Course group not found with id: " + groupId));

            if (cartItemRepository.existsByUserIdAndCourseGroupId(user.getId(), groupId)) {
                throw new InvalidParamException("The course group has already been added to cart");
            }

            if (enrollmentRepository.existsByUserIdAndCourseGroupId(user.getId(), groupId)) {
                throw new InvalidParamException("The course group has already been enrolled");
            }

            List<Course> courses = courseGroup.getCourses();
            if (courses == null || courses.isEmpty()) {
                throw new InvalidParamException("Course group has no courses");
            }

            // Check own course group (all courses same instructor → check first)
            Course firstCourse = courses.getFirst();
            if (firstCourse.getInstructorId() != null) {
                Instructor instructor = instructorRepository
                        .findById(firstCourse.getInstructorId())
                        .orElseThrow(() -> new DataNotFoundException("Instructor not found"));

                if (instructor.getUserId().equals(user.getId())) {
                    throw new InvalidParamException("You cannot add your own course group to cart");
                }
            }

            // Check if any course already in cart (OPTIMIZED – no stream existsBy)
            List<Long> courseIds = courses.stream().map(Course::getId).toList();
            if (cartItemRepository.existsByUserIdAndCourseIdIn(user.getId(), courseIds)) {
                throw new InvalidParamException(
                        "One or more courses in the course group have already been added to cart");
            }

            List<CartItem> cartItems = courses.stream().map(course -> {
                CartItem ci = new CartItem();
                ci.setUser(user);
                ci.setCourse(course);
                ci.setCourseGroup(courseGroup);
                return ci;
            }).toList();

            return cartItemRepository.saveAll(cartItems).getFirst();
        }

        throw new InvalidParamException("Either courseId or courseGroupId must be provided");
    }


    @Override
    public void deleteCartItem(Long id, User user) {
        CartItem cartItem = cartItemRepository.findById(id).orElseThrow(()-> new DataNotFoundException("CartItem not found with id: " + id));
        if(!cartItem.getUser().getId().equals(user.getId())){
            throw new AccessDeniedException("Access denied to delete cart item");
        }
        cartItemRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void deleteAllCartItemsByUserId(@NotNull Long userId) {
        cartItemRepository.deleteAllByUserId(userId);
    }
}
