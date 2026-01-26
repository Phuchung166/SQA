# Online Learning Platform

This project is an online learning platform developed with robust backend technologies to ensure scalability, security, and maintainability.

## Technology Stack

### Core Framework
- **Spring Boot:** Version 3.5.4. A powerful, convention-over-configuration framework for building Java applications.

### Database
- **PostgreSQL:** Used for the primary database storage, integrated with the project using Spring Data JPA.
- **H2 Database:** A fast in-memory database used for testing purposes.

### Cloud Services
- **AWS S3:** Utilized for storing and retrieving files.

### Security
- **Spring Security:** Provides authentication, authorization, and protection against common vulnerabilities.
- **JSON Web Tokens (JWT):** Used for securing the API endpoints by implementing token-based authentication.

### Validation and Object Mapping
- **ModelMapper:** Simplifies object mapping by automatically mapping properties between objects.
- **Spring Validation:** Provides an extensive validation library integrated with Spring Boot.

### Resilience
- **Resilience4j:** Provides fault-tolerance through configurable settings such as retry, rate limiter, etc.

### API Documentation
- **Springdoc OpenAPI:** Automatically generates API documentation using Swagger UI.

### Testing
- **Spring Boot Starter Test:** Provides testing support with JUnit and Mockito.
- **Resilience4j Test:** Enables testing for resilience capabilities like circuit breaking and retries.

### Messaging
- **SendGrid:** Handles email sending services through the SendGrid Java library.

### Build and Dependency Management
- **Maven:** Used for project management and builds, ensuring a structured and efficient build process.

## Other Tools
- **JSON Web Token Library (JJWT):** For creating and verifying JWT tokens.
- **Jackson Databind:** For converting Java Objects to JSON and vice versa.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Java 21 or higher** - [Download JDK](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.6 or higher** - [Download Maven](https://maven.apache.org/download.cgi)
- **PostgreSQL** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **IntelliJ IDEA** (recommended) - [Download IntelliJ IDEA](https://www.jetbrains.com/idea/download/)

### Installation Steps

#### 1. Clone the Repository

```shell
git clone https://github.com/your-username/online-learning.git
cd online-learning
```

#### 2. Setup PostgreSQL Database

Create a new database for the application:

```sql
CREATE DATABASE online_learning;
CREATE USER learning_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE online_learning TO learning_user;
```

#### 3. Create Environment Configuration File

Create a `.env` file in the project root directory with the following variables:

```properties
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/online_learning
DB_USERNAME=learning_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key-here-minimum-256-bits
JWT_EXPIRATION=86400000

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourapp.com

# Application Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
```

**Note:** Replace all placeholder values with your actual credentials. Never commit the `.env` file to version control.

#### 4. Update `.gitignore`

Ensure your `.gitignore` file includes:

```
.env
*.env
application-local.properties
```

#### 5. Install Dependencies

Run Maven to download all required dependencies:

```shell
mvn clean install
```

### Running the Application

#### Option 1: Using Maven Command Line

```shell
mvn spring-boot:run
```

#### Option 2: Using IntelliJ IDEA

##### Setup Environment Variables in IntelliJ Run Configuration

1. **Open Run/Debug Configurations:**
   - Click on `Run` → `Edit Configurations...`
   - Or click the configurations dropdown in the toolbar and select `Edit Configurations...`

2. **Create/Edit Spring Boot Configuration:**
   - Click the `+` button and select `Spring Boot`
   - Name it (e.g., "OnlineLearningApplication")
   - Set the main class to your application's main class

3. **Configure Environment Variables:**
   - In the configuration dialog, find the `Environment variables` field
   - Click the folder icon to open the environment variables dialog
   - Add each variable from your `.env` file in the format: `KEY=value`
   - Or use the "Load from file" option if available

   Example format:
   ```
   DB_URL=jdbc:postgresql://localhost:5432/online_learning;
   DB_USERNAME=learning_user;
   DB_PASSWORD=your_password;
   JWT_SECRET=your-secret-key-here;
   AWS_ACCESS_KEY_ID=your-aws-access-key;
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key;
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

4. **Alternative: Using EnvFile Plugin (Recommended)**
   - Install the "EnvFile" plugin from IntelliJ Marketplace
   - In Run Configuration, enable "EnvFile" tab
   - Add your `.env` file
   - This automatically loads all variables from the file

5. **Set Active Profile (Optional):**
   - In the Run Configuration, add to `Program arguments`:
   ```
   --spring.profiles.active=dev
   ```

6. **Apply and Run:**
   - Click `Apply` then `OK`
   - Click the green Run button to start the application

### Accessing the Application

Once the application is running, you can access:

- **API Base URL:** `http://localhost:8080`
- **Swagger UI Documentation:** `http://localhost:8080/swagger-ui.html`
- **API Docs:** `http://localhost:8080/v3/api-docs`

### Running Tests

Execute the test suite using Maven:

```shell
mvn test
```

### Troubleshooting

#### Common Issues

1. **Database Connection Error:**
   - Verify PostgreSQL is running
   - Check database credentials in `.env` file
   - Ensure the database exists

2. **Port Already in Use:**
   - Change `SERVER_PORT` in `.env` file
   - Or stop the application using the port

3. **Maven Build Failure:**
   - Run `mvn clean` before `mvn install`
   - Check Java version: `java -version`

4. **AWS S3 Connection Issues:**
   - Verify AWS credentials
   - Check IAM permissions for S3 access
   - Ensure bucket exists and region is correct

## Project Structure

```
online-learning/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/ptit/onlinelearning/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-dev.properties
│   └── test/
├── .env (create this file)
├── .gitignore
├── pom.xml
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Acknowledgments

This project leverages the powerful Spring ecosystem and modern cloud services to deliver a comprehensive online learning platform.
