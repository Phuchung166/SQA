package com.ptit.onlinelearning.integration.controller;

import com.ptit.onlinelearning.common.type.*;
import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.integration.config.BaseIntegrationTest;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.CartItemRepository;
import com.ptit.onlinelearning.repository.CategoryRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.request.CartItemRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Cart Item Controller - Add Course to Cart Integration Tests")
class CartItemControllerIT extends BaseIntegrationTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Value("${api.prefix}")
    private String apiPrefix;

    private Role studentRole;
    private Role instructorRole;
    private User studentUser;
    private User instructorUser;
    private Instructor instructor;
    private Category category;
    private Course course;
    private String studentToken;
    private String instructorToken;

    @BeforeEach
    void setUp() {
        // Create roles if they don't exist
        instructorRole = roleRepository.findByName(RoleName.INSTRUCTOR)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.INSTRUCTOR)
                        .build()));

        studentRole = roleRepository.findByName(RoleName.STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.STUDENT)
                        .build()));

        // Create student user with unique email
        long timestamp = System.currentTimeMillis();
        studentUser = User.builder()
                .accountName("teststudent-" + timestamp)
                .firstName("Student")
                .lastName("Test")
                .email("student-" + timestamp + "@test.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(true)
                .emailVerified(true)
                .build();
        studentUser = userRepository.save(studentUser);

        UserRole studentUserRole = UserRole.builder()
                .user(studentUser)
                .role(studentRole)
                .build();
        userRoleRepository.save(studentUserRole);

        // Refresh student user to load roles
        studentUser = userRepository.findById(studentUser.getId()).orElseThrow();
        studentToken = jwtTokenUtils.generateToken(studentUser);

        // Create instructor user with unique email
        instructorUser = User.builder()
                .accountName("testinstructor-" + timestamp)
                .firstName("Instructor")
                .lastName("Test")
                .email("instructor-" + timestamp + "@test.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(true)
                .emailVerified(true)
                .build();
        instructorUser = userRepository.save(instructorUser);

        UserRole instructorUserRole = UserRole.builder()
                .user(instructorUser)
                .role(instructorRole)
                .build();
        userRoleRepository.save(instructorUserRole);

        // Refresh instructor user to load roles
        instructorUser = userRepository.findById(instructorUser.getId()).orElseThrow();

        // Create instructor profile
        instructor = Instructor.builder()
                .userId(instructorUser.getId())
                .slug("instructor-test-" + System.currentTimeMillis())
                .expertise("Software Development")
                .qualification("PhD in Computer Science")
                .build();
        instructor = instructorRepository.save(instructor);

        // Create category
        category = new Category();
        category.setName("Programming");
        category.setDescription("Programming courses");
        category.setIsActive(true);
        category = categoryRepository.save(category);

        // Create course with unique code
        course = new Course();
        course.setCode("JAVA101-" + timestamp);
        course.setTitle("Introduction to Java Programming");
        course.setDescription("Learn Java from scratch");
        course.setCategoryId(category.getId());
        course.setLevel(CourseLevel.BEGINNER);
        course.setLanguage("en");
        course.setPrice(new BigDecimal("99.99"));
        course.setCurrency(Currency.USD);
        course.setIsFree(false);
        course.setIsPreOrder(false);
        course.setEnrollmentType(EnrollmentType.LIFETIME);
        course.setInstructorId(instructor.getId());
        course.setStatus(CourseStatus.PUBLISHED);
        course = courseRepository.save(course);

        // Generate JWT token for instructor
        instructorToken = jwtTokenUtils.generateToken(instructorUser);
    }

    @Test
    @DisplayName("Should add course to cart successfully with valid data and student authentication")
    void shouldAddCourseToCartSuccessfully() throws Exception {
        // Given
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(course.getId());

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.quantity", is(1)));

        // Verify cart item was saved in database
        List<CartItem> cartItems = cartItemRepository.findAll();
        assertThat(cartItems).hasSize(1);
        assertThat(cartItems.getFirst().getQuantity()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return 401 when no authentication token is provided")
    void shouldReturn401WhenNoToken() throws Exception {
        // Given
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(course.getId());

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isUnauthorized());

        // Verify no cart item was created
        assertThat(cartItemRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 403 when instructor tries to add course to cart")
    void shouldReturn403WhenInstructorTriesToAddCourse() throws Exception {
        // Given
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(course.getId());

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isForbidden());

        // Verify no cart item was created
        assertThat(cartItemRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 400 when course does not exist")
    void shouldReturn400WhenCourseDoesNotExist() throws Exception {
        // Given
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(99999L); // Non-existent course ID

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isNotFound());

        // Verify no cart item was created
        assertThat(cartItemRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 400 when course is already in cart")
    void shouldReturn400WhenCourseAlreadyInCart() throws Exception {
        // Given - Add course to cart first
        CartItemRequest firstRequest = new CartItemRequest();
        firstRequest.setCourseId(course.getId());
        
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isCreated());

        // When - Try to add the same course again
        CartItemRequest duplicateRequest = new CartItemRequest();
        duplicateRequest.setCourseId(course.getId());

        // Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify only one cart item exists
        assertThat(cartItemRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Should return 400 when trying to add own course to cart")
    void shouldReturn400WhenAddingOwnCourse() throws Exception {
        // Given - Create a student who is also an instructor with a course
        long studentInstructorTimestamp = System.currentTimeMillis();
        User studentInstructor = User.builder()
                .accountName("studentinstructor-" + studentInstructorTimestamp)
                .firstName("Student")
                .lastName("Instructor")
                .email("studentinstructor-" + studentInstructorTimestamp + "@test.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(true)
                .emailVerified(true)
                .build();
        studentInstructor = userRepository.save(studentInstructor);

        UserRole studentRoleForUser = UserRole.builder()
                .user(studentInstructor)
                .role(studentRole)
                .build();
        userRoleRepository.save(studentRoleForUser);

        UserRole instructorRoleForUser = UserRole.builder()
                .user(studentInstructor)
                .role(instructorRole)
                .build();
        userRoleRepository.save(instructorRoleForUser);

        studentInstructor = userRepository.findById(studentInstructor.getId()).orElseThrow();
        String studentInstructorToken = jwtTokenUtils.generateToken(studentInstructor);

        Instructor studentInstructorProfile = Instructor.builder()
                .userId(studentInstructor.getId())
                .slug("student-instructor-" + System.currentTimeMillis())
                .expertise("Teaching")
                .qualification("MSc")
                .build();
        studentInstructorProfile = instructorRepository.save(studentInstructorProfile);

        Course ownCourse = new Course();
        ownCourse.setCode("OWN101-" + studentInstructorTimestamp);
        ownCourse.setTitle("Own Course");
        ownCourse.setDescription("My own course");
        ownCourse.setCategoryId(category.getId());
        ownCourse.setLevel(CourseLevel.BEGINNER);
        ownCourse.setLanguage("en");
        ownCourse.setPrice(new BigDecimal("49.99"));
        ownCourse.setCurrency(Currency.USD);
        ownCourse.setIsFree(false);
        ownCourse.setIsPreOrder(false);
        ownCourse.setEnrollmentType(EnrollmentType.LIFETIME);
        ownCourse.setInstructorId(studentInstructorProfile.getId());
        ownCourse.setStatus(CourseStatus.PUBLISHED);
        ownCourse = courseRepository.save(ownCourse);

        CartItemRequest request = new CartItemRequest();
        request.setCourseId(ownCourse.getId());

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentInstructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no cart item was created
        assertThat(cartItemRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 400 when neither courseId nor courseGroupId is provided")
    void shouldReturn400WhenNoCourseIdOrCourseGroupId() throws Exception {
        // Given
        CartItemRequest request = new CartItemRequest();
        // Both courseId and courseGroupId are null

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no cart item was created
        assertThat(cartItemRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should add free course to cart successfully")
    void shouldAddFreeCourseToCartSuccessfully() throws Exception {
        // Given - Create a free course with unique code
        long freeCourseTimestamp = System.currentTimeMillis();
        Course freeCourse = new Course();
        freeCourse.setCode("FREE101-" + freeCourseTimestamp);
        freeCourse.setTitle("Free Course");
        freeCourse.setDescription("A free course");
        freeCourse.setCategoryId(category.getId());
        freeCourse.setLevel(CourseLevel.BEGINNER);
        freeCourse.setLanguage("en");
        freeCourse.setPrice(BigDecimal.ZERO);
        freeCourse.setCurrency(Currency.USD);
        freeCourse.setIsFree(true);
        freeCourse.setIsPreOrder(false);
        freeCourse.setEnrollmentType(EnrollmentType.LIFETIME);
        freeCourse.setInstructorId(instructor.getId());
        freeCourse.setStatus(CourseStatus.PUBLISHED);
        freeCourse = courseRepository.save(freeCourse);

        CartItemRequest request = new CartItemRequest();
        request.setCourseId(freeCourse.getId());

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/cart_items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()));

        // Verify cart item was saved
        List<CartItem> cartItems = cartItemRepository.findAll();
        assertThat(cartItems).hasSize(1);
    }
}

