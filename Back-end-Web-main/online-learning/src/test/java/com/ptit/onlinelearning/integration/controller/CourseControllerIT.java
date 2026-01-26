package com.ptit.onlinelearning.integration.controller;

import com.ptit.onlinelearning.common.type.*;
import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.integration.config.BaseIntegrationTest;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.CategoryRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.request.CourseRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@DisplayName("Course Controller - Create Course Integration Tests")
class CourseControllerIT extends BaseIntegrationTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Value("${api.prefix}")
    private String apiPrefix;

    private Role studentRole;
    private Instructor instructor;
    private Category category;
    private String instructorToken;

    @BeforeEach
    void setUp() {
        // Create roles if they don't exist
        Role instructorRole = roleRepository.findByName(RoleName.INSTRUCTOR)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.INSTRUCTOR)
                        .build()));

        studentRole = roleRepository.findByName(RoleName.STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.STUDENT)
                        .build()));

        // Create instructor user with unique email
        long timestamp = System.currentTimeMillis();
        User instructorUser = User.builder()
                .accountName("testinstructor-" + timestamp)
                .firstName("John")
                .lastName("Doe")
                .email("instructor-" + timestamp + "@test.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(true)
                .emailVerified(true)
                .build();
        instructorUser = userRepository.save(instructorUser);

        // Create user role
        UserRole userRole = UserRole.builder()
                .user(instructorUser)
                .role(instructorRole)
                .build();
        userRoleRepository.save(userRole);

        // Refresh user to load roles
        instructorUser = userRepository.findById(instructorUser.getId()).orElseThrow();

        // Create instructor profile
        instructor = Instructor.builder()
                .userId(instructorUser.getId())
                .slug("john-doe-" + System.currentTimeMillis())
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

        // Generate JWT token for instructor
        instructorToken = jwtTokenUtils.generateToken(instructorUser);
    }

    @Test
    @DisplayName("Should create course successfully with valid data and instructor authentication")
    void shouldCreateCourseSuccessfully() throws Exception {
        // Given
        CourseRequest request = CourseRequest.builder()
                .code("JAVA101")
                .title("Introduction to Java Programming")
                .description("Learn Java from scratch")
                .thumbnail("https://example.com/thumbnail.jpg")
                .previewVideo("https://example.com/preview.mp4")
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("en")
                .price(new BigDecimal("99.99"))
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .whatYouLearn(Arrays.asList("Java basics", "OOP concepts", "Best practices"))
                .targetAudiences(Arrays.asList("Beginners", "Students", "Career switchers"))
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is("JAVA101")))
                .andExpect(jsonPath("$.title", is("Introduction to Java Programming")))
                .andExpect(jsonPath("$.description", is("Learn Java from scratch")))
                .andExpect(jsonPath("$.level", is("BEGINNER")))
                .andExpect(jsonPath("$.language", is("en")))
                .andExpect(jsonPath("$.price", is(99.99)))
                .andExpect(jsonPath("$.currency", is("USD")))
                .andExpect(jsonPath("$.is_free", is(false)))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.enrollment_type", is("LIFETIME")));

        // Verify course was saved in database
        List<Course> courses = courseRepository.findAllWithInstructorAndUser();
        assertThat(courses).hasSize(1);
        Course savedCourse = courses.getFirst();
        assertThat(savedCourse.getCode()).isEqualTo("JAVA101");
        assertThat(savedCourse.getTitle()).isEqualTo("Introduction to Java Programming");
        assertThat(savedCourse.getInstructorId()).isEqualTo(instructor.getId());
        assertThat(savedCourse.getInstructor().getUser().getLastName()).isEqualTo("Doe");
        assertThat(savedCourse.getInstructor().getUser().getFirstName()).isEqualTo("John");
        assertThat(savedCourse.getCategoryId()).isEqualTo(category.getId());
        assertThat(savedCourse.getStatus()).isEqualTo(CourseStatus.DRAFT);
    }

    @Test
    @DisplayName("Should create free course successfully")
    void shouldCreateFreeCourseSuccessfully() throws Exception {
        // Given
        CourseRequest request = CourseRequest.builder()
                .code("FREE101")
                .title("Free Introduction Course")
                .description("A free course for everyone")
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("en")
                .price(BigDecimal.ZERO)
                .currency(Currency.USD)
                .isFree(true)
                .enrollmentType(EnrollmentType.LIFETIME)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is("FREE101")))
                .andExpect(jsonPath("$.is_free", is(true)))
                .andExpect(jsonPath("$.price", is(0)));

        // Verify
        List<Course> courses = courseRepository.findAll();
        assertThat(courses).hasSize(1);
        assertThat(courses.getFirst().getIsFree()).isTrue();
    }

    @Test
    @DisplayName("Should create course with course modules and lessons")
    void shouldCreateCourseWithModulesAndLessons() throws Exception {
        // Given
        CourseRequest.CourseModuleDTO.LessonDTO lesson = new CourseRequest.CourseModuleDTO.LessonDTO();
        lesson.setTitle("Introduction to Variables");
        lesson.setDescription("Learn about variables in Java");
        lesson.setContentType("video");
        lesson.setVideoUrl("https://example.com/lesson1.mp4");
        lesson.setDuration(600L);
        lesson.setSortOrder(0);
        lesson.setIsMandatory(true);

        CourseRequest.CourseModuleDTO module = new CourseRequest.CourseModuleDTO();
        module.setTitle("Getting Started");
        module.setDescription("Introduction module");
        module.setSortOrder(0);
        module.setLessonDTOs(List.of(lesson));

        CourseRequest request = CourseRequest.builder()
                .code("JAVA102")
                .title("Java with Modules")
                .description("Java course with modules")
                .categoryId(category.getId())
                .level(CourseLevel.INTERMEDIATE)
                .language("en")
                .price(new BigDecimal("149.99"))
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .courseModuleDTOs(List.of(module))
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is("JAVA102")))
                .andExpect(jsonPath("$.title", is("Java with Modules")));

        // Verify course was saved
        List<Course> courses = courseRepository.findAll();
        assertThat(courses).hasSize(1);
    }

    @Test
    @DisplayName("Should create pre-order course successfully")
    void shouldCreatePreOrderCourseSuccessfully() throws Exception {
        // Given
        LocalDateTime preOrderStart = LocalDateTime.now().plusDays(1);
        LocalDateTime preOrderEnd = LocalDateTime.now().plusDays(30);

        CourseRequest request = CourseRequest.builder()
                .code("PREORDER101")
                .title("Pre-order Course")
                .description("Early bird special")
                .categoryId(category.getId())
                .level(CourseLevel.ADVANCED)
                .language("en")
                .price(new BigDecimal("199.99"))
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(true)
                .preOrderStartDate(preOrderStart)
                .preOrderEndDate(preOrderEnd)
                .preOrderPrice(new BigDecimal("149.99"))
                .preOrderTotalSlots(100)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is("PREORDER101")))
                .andExpect(jsonPath("$.price", is(199.99)));
    }

    @Test
    @DisplayName("Should return 401 when no authentication token is provided")
    void shouldReturn401WhenNoToken() throws Exception {
        // Given
        CourseRequest request = CourseRequest.builder()
                .code("NOAUTH101")
                .title("No Auth Course")
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("en")
                .price(new BigDecimal("99.99"))
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isUnauthorized());

        // Verify no course was created
        assertThat(courseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 403 when student tries to create course")
    void shouldReturn403WhenStudentTriesToCreateCourse() throws Exception {
        // Given - Create student user with unique email
        long studentTimestamp = System.currentTimeMillis();
        User studentUser = User.builder()
                .accountName("teststudent-" + studentTimestamp)
                .email("student-" + studentTimestamp + "@test.com")
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
        String studentToken = jwtTokenUtils.generateToken(studentUser);

        CourseRequest request = CourseRequest.builder()
                .code("STUDENT101")
                .title("Student Course")
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("en")
                .price(new BigDecimal("99.99"))
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isForbidden());

        // Verify no course was created
        assertThat(courseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 400 when required fields are missing")
    void shouldReturn400WhenRequiredFieldsMissing() throws Exception {
        // Given - Request missing required fields
        CourseRequest request = CourseRequest.builder()
                .code("INVALID101")
                // Missing title
                .categoryId(category.getId())
                // Missing level
                // Missing language
                // Missing price
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no course was created
        assertThat(courseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 400 when invalid URL format is provided")
    void shouldReturn400WhenInvalidUrlFormat() throws Exception {
        // Given
        CourseRequest request = CourseRequest.builder()
                .code("URL101")
                .title("URL Test Course")
                .thumbnail("invalid-url") // Invalid URL format
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("en")
                .price(new BigDecimal("99.99"))
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no course was created
        assertThat(courseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should return 400 when negative price is provided")
    void shouldReturn400WhenNegativePrice() throws Exception {
        // Given
        CourseRequest request = CourseRequest.builder()
                .code("PRICE101")
                .title("Price Test Course")
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("en")
                .price(new BigDecimal("-50.00")) // Negative price
                .currency(Currency.USD)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no course was created
        assertThat(courseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Should create course with VND currency")
    void shouldCreateCourseWithVndCurrency() throws Exception {
        // Given
        CourseRequest request = CourseRequest.builder()
                .code("VND101")
                .title("Vietnamese Course")
                .description("Course priced in VND")
                .categoryId(category.getId())
                .level(CourseLevel.BEGINNER)
                .language("vi")
                .price(new BigDecimal("1990000"))
                .currency(Currency.VND)
                .isFree(false)
                .enrollmentType(EnrollmentType.LIFETIME)
                .build();

        // When & Then
        mockMvc.perform(post("/" + apiPrefix + "/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is("VND101")))
                .andExpect(jsonPath("$.currency", is("VND")))
                .andExpect(jsonPath("$.language", is("vi")));

        // Verify
        List<Course> courses = courseRepository.findAll();
        assertThat(courses).hasSize(1);
        assertThat(courses.getFirst().getCurrency()).isEqualTo(Currency.VND);
    }

//    @Override
//    public void tearDown() {
//        try {
//            courseRepository.deleteAll();
//            categoryRepository.deleteAll();
//            super.tearDown();
//        } catch (Exception e) {
//            System.err.println("Warning: Failed to clean up test data: " + e.getMessage());
//        }
//    }
}

