# CI Integration Tests Setup

## 🎯 Overview


## 🔧 Changes Made

### 1. **GitHub Actions Workflow** (`.github/workflows/ci.yml`)

```yaml
jobs:
  integration-tests:  # ✅ Renamed from build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Set up Docker Buildx  # ✅ Added Docker support
        uses: docker/setup-buildx-action@v3
        
      - name: Build and run integration tests  # ✅ Changed command
        run: mvn -B clean verify -DskipUnitTests=true -Dspring.profiles.active=ci
        env:
          TESTCONTAINERS_REUSE_ENABLE: false  # ✅ Clean state in CI
```

**Key Changes:**
- ✅ **Skip unit tests:** `-DskipUnitTests=true`
- ✅ **Run integration tests:** `mvn verify`
- ✅ **Docker support:** Added Docker Buildx setup
- ✅ **CI profile:** `-Dspring.profiles.active=ci`
- ✅ **Clean containers:** `TESTCONTAINERS_REUSE_ENABLE=false`

### 2. **CI Application Config** (`application-ci.yml`)

```yaml
spring:
  datasource:
    driver-class-name: org.postgresql.Driver  # ✅ PostgreSQL instead of H2
    hikari:
      maximum-pool-size: 3                    # ✅ Optimized for CI
      connection-timeout: 30000               # ✅ CI-appropriate timeouts
      
  jpa:
    hibernate:
      ddl-auto: validate                      # ✅ Use Flyway migrations
      
  flyway:
    enabled: true                             # ✅ Enable migrations in CI
    
logging:
  level:
    com.ptit.onlinelearning: WARN            # ✅ Minimal logging for CI
    org.hibernate.SQL: ERROR                 # ✅ No SQL noise
```

**Key Changes:**
- ✅ **PostgreSQL:** Replaced H2 with PostgreSQL via Testcontainers
- ✅ **Flyway enabled:** Use real migrations like production
- ✅ **Optimized logging:** Reduce CI noise
- ✅ **Smaller connection pool:** Optimized for CI resources

### 3. **TestContainerManager** Updates

```java
// Check if running in CI environment
boolean isCI = "true".equals(System.getenv("CI")) || 
              "true".equals(System.getenv("GITHUB_ACTIONS"));

postgres = new PostgreSQLContainer<>(...)
    .withReuse(!isCI);  // ✅ Disable reuse in CI for clean state
```

**Key Changes:**
- ✅ **CI Detection:** Auto-detect CI environment
- ✅ **No reuse in CI:** Fresh containers for each CI run
- ✅ **Reuse locally:** Keep fast development experience

## 🚀 CI Pipeline Flow

```
1. Checkout code
   ↓
2. Setup JDK 21 + Maven cache
   ↓  
3. Setup Docker Buildx
   ↓
4. Run: mvn clean verify -DskipUnitTests=true -Dspring.profiles.active=ci
   ↓
5. TestContainerManager detects CI → creates fresh containers
   ↓
6. Flyway runs migrations (V1 → V13)
   ↓
7. Run integration tests:
   - AuthControllerIT (9 tests)
   - AuthControllerWithBuilderIT (3 tests)
   ↓
8. Containers auto-cleanup
   ↓
9. Send Telegram notification
```

## 📊 Expected Performance

### **CI Environment:**
- **Container startup:** ~30-45 seconds
- **Migration time:** ~5-10 seconds  
- **Test execution:** ~15-20 seconds
- **Total time:** ~60-75 seconds

### **Local Development:**
- **First run:** ~45 seconds (container creation)
- **Subsequent runs:** ~20 seconds (container reuse)

## 🛠️ Commands

### **Local Development:**
```bash
# Run integration tests locally (with container reuse)
mvn verify -DskipUnitTests=true

# Run with CI profile locally (no reuse)
mvn verify -DskipUnitTests=true -Dspring.profiles.active=ci
```

### **CI Environment:**
```bash
# Automatic in GitHub Actions
mvn -B clean verify -DskipUnitTests=true -Dspring.profiles.active=ci
```

## 🔍 Monitoring & Debugging

### **Check CI Logs:**
1. Go to GitHub Actions tab
2. Click on latest workflow run
3. Expand "Build and run integration tests" step
4. Look for:
   ```
   [INFO] TestContainerManager - PostgreSQL container started: jdbc:postgresql://localhost:xxxxx/testdb
   [INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
   ```

### **Local Debugging:**
```bash
# Run with debug logging
mvn verify -DskipUnitTests=true -Dlogging.level.com.ptit.onlinelearning.integration=DEBUG

# Check containers
docker ps --filter "label=org.testcontainers"
```

## 📝 Benefits

### **✅ Production-like Testing:**
- Real PostgreSQL database (not H2)
- Real Redis and RabbitMQ
- Flyway migrations like production

### **✅ CI/CD Optimized:**
- Clean container state each run
- Optimized resource usage
- Proper cleanup

### **✅ Developer Experience:**
- Fast local development (container reuse)
- Same tests run locally and CI
- Easy debugging

## 🚨 Troubleshooting

### **Common Issues:**

1. **Docker not available in CI:**
   ```
   Error: Cannot connect to Docker daemon
   ```
   **Solution:** Ensure `docker/setup-buildx-action@v3` is included

2. **Container startup timeout:**
   ```
   Error: Container startup timeout
   ```
   **Solution:** Check CI runner resources, may need to increase timeouts

3. **Migration failures:**
   ```
   Error: Flyway migration failed
   ```
   **Solution:** Check migration files compatibility with PostgreSQL

### **Debug Commands:**
```bash
# Check CI environment detection
echo "CI: $CI"
echo "GITHUB_ACTIONS: $GITHUB_ACTIONS"

# Manual container cleanup
docker rm -f $(docker ps -aq --filter "label=org.testcontainers")
```

## 🎯 Next Steps

1. **Add more integration tests:**
   - CourseControllerIT
   - PaymentControllerIT
   - UserControllerIT

2. **Performance monitoring:**
   - Track CI execution time
   - Monitor resource usage

3. **Test coverage:**
   - Add JaCoCo for integration test coverage
   - Set coverage thresholds

4. **Parallel execution:**
   - Consider parallel test execution for faster CI
