package com.ptit.onlinelearning.integration.config;

import com.redis.testcontainers.RedisContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Singleton manager for test containers.
 * Ensures only one instance of each container is created and shared across all integration tests.
 * This prevents connection pool issues and improves test performance.
 */
public class TestContainerManager {
    
    private static final Logger log = LoggerFactory.getLogger(TestContainerManager.class);
    
    private static volatile TestContainerManager instance;
    private static final Object lock = new Object();
    
    private final PostgreSQLContainer<?> postgres;
    private final RedisContainer redis;
    private final RabbitMQContainer rabbitmq;
    
    private TestContainerManager() {
        log.info("Initializing TestContainerManager...");
        
        // Check if running in CI environment
        boolean isCI = "true".equals(System.getenv("CI")) || 
                      "true".equals(System.getenv("GITHUB_ACTIONS"));
        
        // Initialize PostgreSQL container
        postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
                .withDatabaseName("testdb")
                .withUsername("test")
                .withPassword("test")
                .withReuse(!isCI);  // Disable reuse in CI for clean state
        
        // Initialize Redis container
        redis = new RedisContainer(DockerImageName.parse("redis:7-alpine"))
                .withExposedPorts(6379)
                .withReuse(!isCI);  // Disable reuse in CI
        
        // Initialize RabbitMQ container
        rabbitmq = new RabbitMQContainer(DockerImageName.parse("rabbitmq:3.12-management"))
                .withExposedPorts(5672, 15672)
                .withReuse(!isCI);  // Disable reuse in CI
        
        // Start all containers
        startContainers();
    }
    
    /**
     * Get singleton instance of TestContainerManager
     */
    public static TestContainerManager getInstance() {
        if (instance == null) {
            synchronized (lock) {
                if (instance == null) {
                    instance = new TestContainerManager();
                }
            }
        }
        return instance;
    }
    
    /**
     * Start all containers if not already started
     */
    private void startContainers() {
        try {
            log.info("Starting PostgreSQL container...");
            if (!postgres.isRunning()) {
                postgres.start();
            }
            log.info("PostgreSQL container started: {}", postgres.getJdbcUrl());
            
            log.info("Starting Redis container...");
            if (!redis.isRunning()) {
                redis.start();
            }
            log.info("Redis container started: {}:{}", redis.getHost(), redis.getFirstMappedPort());
            
            log.info("Starting RabbitMQ container...");
            if (!rabbitmq.isRunning()) {
                rabbitmq.start();
                // Install and enable rabbitmq-delayed-message-exchange plugin
                installRabbitMQDelayedMessagePlugin();
            }
            log.info("RabbitMQ container started: {}:{}", rabbitmq.getHost(), rabbitmq.getAmqpPort());
            
        } catch (Exception e) {
            log.error("Failed to start containers", e);
            throw new RuntimeException("Failed to start test containers", e);
        }
    }
    
    /**
     * Get PostgreSQL container instance
     */
    public PostgreSQLContainer<?> getPostgres() {
        return postgres;
    }
    
    /**
     * Get Redis container instance
     */
    public RedisContainer getRedis() {
        return redis;
    }
    
    /**
     * Install and enable rabbitmq-delayed-message-exchange plugin
     */
    private void installRabbitMQDelayedMessagePlugin() {
        try {
            log.info("Waiting for RabbitMQ to be ready...");
            // Wait for RabbitMQ to be fully started
            waitForRabbitMQReady();
            
            log.info("Installing rabbitmq-delayed-message-exchange plugin...");
            
            // Download plugin
            rabbitmq.execInContainer(
                "sh", "-c",
                "apt-get update && apt-get install -y curl && " +
                "curl -L -o /opt/rabbitmq/plugins/rabbitmq_delayed_message_exchange-3.12.0.ez " +
                "https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.12.0/rabbitmq_delayed_message_exchange-3.12.0.ez"
            );
            
            // Enable plugin
            rabbitmq.execInContainer(
                "rabbitmq-plugins", "enable", "rabbitmq_delayed_message_exchange"
            );
            
            log.info("rabbitmq-delayed-message-exchange plugin installed and enabled successfully");
        } catch (Exception e) {
            log.warn("Failed to install rabbitmq-delayed-message-exchange plugin: {}", e.getMessage());
            log.warn("Pre-order expiration scheduling may not work in tests");
        }
    }
    
    /**
     * Wait for RabbitMQ to be ready by checking if rabbitmqctl responds
     */
    private void waitForRabbitMQReady() {
        int maxRetries = 30;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                org.testcontainers.containers.Container.ExecResult result = 
                    rabbitmq.execInContainer("rabbitmqctl", "status");
                if (result.getExitCode() == 0) {
                    log.info("RabbitMQ is ready");
                    return;
                }
            } catch (Exception e) {
                // RabbitMQ not ready yet, continue waiting
            }
            
            retryCount++;
            try {
                Thread.sleep(1000); // Wait 1 second before retry
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for RabbitMQ", ie);
            }
        }
        
        log.warn("RabbitMQ may not be fully ready, but proceeding with plugin installation");
    }
    
    /**
     * Get RabbitMQ container instance
     */
    public RabbitMQContainer getRabbitmq() {
        return rabbitmq;
    }
    
    /**
     * Stop all containers (typically called during JVM shutdown)
     */
    public void stopContainers() {
        log.info("Stopping all test containers...");
        
        try {
            if (postgres != null && postgres.isRunning()) {
                postgres.stop();
                log.info("PostgreSQL container stopped");
            }
        } catch (Exception e) {
            log.warn("Error stopping PostgreSQL container", e);
        }
        
        try {
            if (redis != null && redis.isRunning()) {
                redis.stop();
                log.info("Redis container stopped");
            }
        } catch (Exception e) {
            log.warn("Error stopping Redis container", e);
        }
        
        try {
            if (rabbitmq != null && rabbitmq.isRunning()) {
                rabbitmq.stop();
                log.info("RabbitMQ container stopped");
            }
        } catch (Exception e) {
            log.warn("Error stopping RabbitMQ container", e);
        }
    }
    
    /**
     * Get connection details for logging/debugging
     */
    public String getConnectionInfo() {
        return String.format(
            "Test Containers Info:\n" +
            "  PostgreSQL: %s (user: %s, db: %s)\n" +
            "  Redis: %s:%d\n" +
            "  RabbitMQ: %s:%d (management: %d)",
            postgres.getJdbcUrl(), postgres.getUsername(), postgres.getDatabaseName(),
            redis.getHost(), redis.getFirstMappedPort(),
            rabbitmq.getHost(), rabbitmq.getAmqpPort(), rabbitmq.getHttpPort()
        );
    }
    
    // Add shutdown hook to clean up containers
    static {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (instance != null) {
                instance.stopContainers();
            }
        }));
    }
}
