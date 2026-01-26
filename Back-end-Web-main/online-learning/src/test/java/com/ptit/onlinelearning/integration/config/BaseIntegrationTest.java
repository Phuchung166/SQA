package com.ptit.onlinelearning.integration.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.onlinelearning.repository.*;
import com.redis.testcontainers.RedisContainer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;

/**
 * Base class for integration tests.
 * Provides common configuration and utilities for all integration tests.
 * Uses TestContainerManager singleton to manage PostgreSQL, Redis, and RabbitMQ containers.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
public abstract class BaseIntegrationTest {

    private static final TestContainerManager containerManager = TestContainerManager.getInstance();

    /**
     * Configure Spring properties dynamically from running containers
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        PostgreSQLContainer<?> postgres = containerManager.getPostgres();
        RedisContainer redis = containerManager.getRedis();
        RabbitMQContainer rabbitmq = containerManager.getRabbitmq();
        
        // PostgreSQL configuration
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        
        // Redis configuration
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", redis::getFirstMappedPort);
        
        // RabbitMQ configuration
        registry.add("spring.rabbitmq.host", rabbitmq::getHost);
        registry.add("spring.rabbitmq.port", rabbitmq::getAmqpPort);
        registry.add("spring.rabbitmq.username", () -> "guest");
        registry.add("spring.rabbitmq.password", () -> "guest");
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected UserRoleRepository userRoleRepository;

    @Autowired
    protected RoleRepository roleRepository;

    @Autowired
    protected InstructorRepository instructorRepository;

    @Autowired(required = false)
    protected CartItemRepository cartItemRepository;

    @Autowired(required = false)
    protected CourseRepository courseRepository;

    @Autowired(required = false)
    protected CategoryRepository categoryRepository;

    @BeforeAll
    static void beforeAll() {
        // Log container connection info for debugging
        System.out.println(containerManager.getConnectionInfo());
    }

    /**
     * Clean up database after each test to ensure test isolation
     */
    @AfterEach
    void tearDown() {
        try {
            // Delete in order of dependencies
            if (cartItemRepository != null) {
                cartItemRepository.deleteAll();
            }
            if (courseRepository != null) {
                courseRepository.deleteAll();
            }
            if (categoryRepository != null) {
                categoryRepository.deleteAll();
            }
            userRoleRepository.deleteAll();
            instructorRepository.deleteAll();
            userRepository.deleteAll();
            // Note: We don't delete roles as they should be seeded
        } catch (Exception e) {
            // Log but don't fail test if cleanup fails
            System.err.println("Warning: Failed to clean up test data: " + e.getMessage());
        }
    }
}

