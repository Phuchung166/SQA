package com.ptit.onlinelearning.service.instructor;

import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.type.EarningStatus;
import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.InstructorMonthlyEarning;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.projection.InstructorIncomeProjection;
import com.ptit.onlinelearning.projection.InstructorStatsProjection;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.InstructorMonthlyEarningRepository;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.repository.OrderRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.component.SendGridSender;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.response.instructor.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class InstructorService implements IInstructorService{

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OrderRepository orderRepository;
    private final InstructorMonthlyEarningRepository instructorMonthlyEarningRepository;
    private final SendGridSender sendGridSender;
    
    @Override
    public InstructorUserResponse getInstructorBySlug(String slug) {
        // Find instructor by slug
        Instructor instructor = instructorRepository.findBySlug(slug)
                .orElseThrow(() -> new DataNotFoundException("Instructor not found with slug: " + slug));
        
        // Get user information from the instructor's one-to-one relationship
        User user = instructor.getUser();
        
        if (user == null) {
            throw new DataNotFoundException("User information not found for instructor with slug: " + slug);
        }
        
        InstructorUserResponse response = new InstructorUserResponse();
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setAvatar(user.getAvatar());
        response.setBio(user.getBio());
        response.setExpertise(instructor.getExpertise());
        response.setTotalCourses(courseRepository.countByInstructorId(instructor.getId()));
        response.setExperienceYears(instructor.getExperienceYears() != null ? 
                instructor.getExperienceYears().toString() : null);
        response.setQualification(instructor.getQualification());
        response.setReview(InstructorReviewResponse.fromEntity(instructor));
        
        return response;
    }

    @Override
    public InstructorUserResponse getInstructorById(Long id) {
        Instructor instructor =  instructorRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Instructor not found with id: " + id));
        User user = instructor.getUser();

        if (user == null) {
            throw new DataNotFoundException("User information not found for instructor with slug: " + id);
        }
        InstructorStatsProjection stats = instructorRepository.getInstructorStats(id);

        // Map to InstructorResponse
        InstructorUserResponse response = new InstructorUserResponse();
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setAvatar(user.getAvatar());
        response.setBio(user.getBio());
        response.setExpertise(instructor.getExpertise());
        response.setExperienceYears(instructor.getExperienceYears() != null ?
                instructor.getExperienceYears().toString() : null);
        response.setQualification(instructor.getQualification());
        response.setBankName(instructor.getBankName());
        response.setBankAccount(instructor.getBankAccount());
        response.setTotalCourses(stats.getTotalCourses());
        response.setTotalStudents(stats.getTotalStudents());
        response.setReview(InstructorReviewResponse.fromEntity(instructor));

        return response;
    }

    @Override
    public List<TopInstructorResponse> getTopInstructors() {
        List<Instructor> topInstructors = instructorRepository.findTop10ByOrderByTotalStudentsDescTotalCoursesDesc();
        
        return topInstructors.stream()
                .limit(10)
                .map(instructor -> {
                    User user = instructor.getUser();
                    return new TopInstructorResponse(
                            user.getAvatar(),
                            user.getFirstName(),
                            user.getLastName(),
                            instructor.getExpertise(),
                            instructor.getSlug(),
                            user.getAccountName(),
                            InstructorReviewResponse.fromEntity(instructor)
                    );
                })
                .toList();
    }

    @Override
    public Page<InstructorAdminResponse> getAllInstructorsForAdmin(int page, int pageSize, String search, String sortBy, String sortOrder) {
        // Create sort direction
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        // Create sort object - default to createdAt if sortBy is null or empty
        String sortField = (sortBy == null || sortBy.trim().isEmpty()) ? "createdAt" : sortBy;
        Sort sort = Sort.by(direction, sortField);
        
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        
        Page<User> usersPage = userRepository.findUsersByRoleWithSearch(
            RoleName.INSTRUCTOR,
            search, 
            pageable
        );
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        return usersPage.map(user -> {
            InstructorAdminResponse response = new InstructorAdminResponse();
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setPhone(user.getPhone());
            response.setAvatar(user.getAvatar());
            response.setBio(user.getBio());
            response.setAccountName(user.getAccountName());
            response.setDateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
            response.setGender(user.getGender() != null ? user.getGender().toString() : null);
            response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().format(formatter) : null);
            response.setUpdatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().format(formatter) : null);

            if (user.getInstructor() != null) {
                Instructor instructor = user.getInstructor();
                response.setExpertise(instructor.getExpertise());
                response.setExperienceYears(instructor.getExperienceYears() != null ? 
                    instructor.getExperienceYears().toString() : null);
                response.setQualification(instructor.getQualification());
                response.setTotalCourses((courseRepository.countByInstructorId(instructor.getId())));
                response.setReview(InstructorReviewResponse.fromEntity(instructor));
            }
            
            return response;
        });
    }

    @Override
    public PageableResponse<UserResponse> getAllStudentOfInstructor(Long courseId, CourseType courseType, int page,
                                                                    int pageSize, String sortBy, String sortOrder, String search) {
        // Create sort direction
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        // Default sort by enrollmentDate if not specified
        String sortField = (sortBy == null || sortBy.trim().isEmpty()) ? "enrollmentDate" : sortBy;
        Sort sort = Sort.by(direction, sortField);
        
        // Convert page to 0-based index for Spring Data
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        
        Page<UserResponse> usersPage;
        
        if (courseType == CourseType.GROUP) {
            usersPage = enrollmentRepository.getAllUserEnrolledInCourseGroup(courseId, search, pageable);
        } else {
            usersPage = enrollmentRepository.getAllUserEnrolledInCourse(courseId, search, pageable);
        }
        
        return new PageableResponse<>(
                usersPage.getNumber() + 1,
                usersPage.getTotalPages(),
                usersPage.getTotalElements(),
                usersPage.getSize(),
                usersPage.hasNext(),
                usersPage.hasPrevious(),
                usersPage.getContent()
        );
    }

    @Override
    public InstructorIncomeDetailResponse getInstructorIncome(Long instructorId, int page, int pageSize) {
        // Get instructor and verify exists
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new DataNotFoundException("Instructor not found with id: " + instructorId));
        
        // Get commission rate (default 70%)
        BigDecimal commissionRate = instructor.getCommissionRate() != null 
                ? instructor.getCommissionRate() 
                : new BigDecimal("70.00");
        
        // Convert page to 0-based index for Spring Data
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        
        Page<InstructorIncomeProjection> projectionPage = orderRepository.findInstructorIncome(instructorId, pageable);
        
        // Calculate total income with commission
        BigDecimal totalGrossIncome = BigDecimal.ZERO;
        
        // Convert projections to response and calculate instructor's income (70%)
        List<InstructorIncomeResponse> responseList = projectionPage.getContent().stream()
                .map(projection -> {
                    BigDecimal grossIncome = projection.getIncome();
                    BigDecimal instructorIncome = grossIncome
                            .multiply(commissionRate)
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                    
                    return new InstructorIncomeResponse(
                            projection.getCourseTitle(),
                            instructorIncome,
                            projection.getThumbnail(),
                            CourseType.valueOf(projection.getCourseType()),
                            projection.getTotalSales()
                    );
                })
                .collect(Collectors.toList());
        
        // Calculate total income from all pages (need to query total from all records)
        totalGrossIncome = orderRepository.findTotalInstructorIncome(instructorId);
        BigDecimal totalInstructorIncome = totalGrossIncome
                .multiply(commissionRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        PageableResponse<InstructorIncomeResponse> coursesPage = new PageableResponse<>(
                projectionPage.getNumber() + 1,
                projectionPage.getTotalPages(),
                projectionPage.getTotalElements(),
                projectionPage.getSize(),
                projectionPage.hasNext(),
                projectionPage.hasPrevious(),
                responseList
        );
        
        return InstructorIncomeDetailResponse.builder()
                .totalIncome(totalInstructorIncome)
                .commissionRate(commissionRate)
                .courses(coursesPage)
                .build();
    }

    @Override
    public Page<InstructorCurrentMonthEarning> getAllInstructorsCurrentMonthEarning(int page, int pageSize,
                                                                                    String search, String sortBy, String sortOrder) {
        // Get current year and month
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();
        
        // Create sort direction
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        // Default sort by currentMonthEarning if not specified
        String sortField = (sortBy == null || sortBy.trim().isEmpty()) ? "currentMonthEarning" : sortBy;
        Sort sort = Sort.by(direction, sortField);
        
        // Convert page to 0-based index for Spring Data
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        
        // Call repository method
        Page<Object[]> resultPage = orderRepository.findAllInstructorsCurrentMonthEarning(
                currentYear, 
                currentMonth, 
                search, 
                pageable
        );
        
        // Format current month as "YYYY-MM"
        String currentMonthStr = String.format("%d-%02d", currentYear, currentMonth);
        
        // Convert Object[] to InstructorCurrentMonthEarning
        return resultPage.map(row -> InstructorCurrentMonthEarning.builder()
                .currentMonth(currentMonthStr)
                .email((String) row[0])
                .accountName((String) row[1])
                .bankName((String) row[2])
                .bankAccount((String) row[3])
                .firstName((String) row[4])
                .lastName((String) row[5])
                .currentMonthEarning((BigDecimal) row[6])
                .build()
        );
    }

    @Override
    public Page<InstructorMonthlyEarningResponse> getInstructorsMonthlyEarnings(Integer year, Integer month, 
                                                                                EarningStatus paymentStatus,
                                                                                int page, int pageSize, 
                                                                                String sortBy, String sortOrder) {
        // Create sort direction
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        // Default sort by totalEarning if not specified
        String sortField = (sortBy == null || sortBy.trim().isEmpty()) ? "totalEarning" : sortBy;
        Sort sort = Sort.by(direction, sortField);
        
        // Convert page to 0-based index for Spring Data
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        
        // Query from InstructorMonthlyEarning table
        Page<InstructorMonthlyEarning> earningsPage;
        if (paymentStatus != null) {
            earningsPage = instructorMonthlyEarningRepository.findByYearAndMonthAndPaymentStatus(
                    year, 
                    month, 
                    paymentStatus,
                    pageable
            );
        } else {
            earningsPage = instructorMonthlyEarningRepository.findByYearAndMonth(
                    year, 
                    month, 
                    pageable
            );
        }
        
        // Convert to response DTO
        return earningsPage.map(InstructorMonthlyEarningResponse::fromEntity);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public InstructorMonthlyEarningResponse updatePaymentStatus(Long earningId, EarningStatus paymentStatus) {
        // Find the earning record
        InstructorMonthlyEarning earning = instructorMonthlyEarningRepository.findById(earningId)
                .orElseThrow(() -> new DataNotFoundException("Instructor monthly earning not found with id: " + earningId));
        
        // Get the instructor
        Instructor instructor = earning.getInstructor();
        if (instructor == null) {
            throw new DataNotFoundException("Instructor not found for earning id: " + earningId);
        }
        
        // Check if status is being changed to PAID
        boolean isChangingToPaid = paymentStatus == EarningStatus.PAID && earning.getPaymentStatus() != EarningStatus.PAID;
        
        // Update payment status
        earning.setPaymentStatus(paymentStatus);
        
        // If changing to PAID, set paidAt timestamp
        if (isChangingToPaid) {
            earning.setPaidAt(java.time.LocalDateTime.now());
        }
        
        // Save the updated earning
        instructorMonthlyEarningRepository.save(earning);
        
        // Send email notification if status changed to PAID
        if (isChangingToPaid) {
            try {
                String instructorEmail = instructor.getUser().getEmail();
                sendGridSender.sendInstructorPaymentSuccessEmail(instructorEmail, earning, instructor);
            } catch (Exception e) {
                // Log error but don't fail the transaction
                log.error("Failed to send payment success email to instructor: {}", instructor.getUser().getEmail(), e);
            }
        }
        
        // Return updated response
        return InstructorMonthlyEarningResponse.fromEntity(earning);
    }


}
