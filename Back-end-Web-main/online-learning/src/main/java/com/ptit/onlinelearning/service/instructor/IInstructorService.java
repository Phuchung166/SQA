package com.ptit.onlinelearning.service.instructor;

import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.type.EarningStatus;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.response.instructor.*;
import org.springframework.data.domain.Page;
import java.util.List;

public interface IInstructorService {

    InstructorUserResponse getInstructorBySlug(String slug);

    InstructorUserResponse getInstructorById(Long userId);
    
    List<TopInstructorResponse> getTopInstructors();

    Page<InstructorAdminResponse> getAllInstructorsForAdmin(int page, int pageSize, String search, String sortBy, String sortOrder);


    PageableResponse<UserResponse> getAllStudentOfInstructor(Long courseId, CourseType courseType,
                                                             int page, int pageSize, String sortBy, String sortOrder, String search);

    InstructorIncomeDetailResponse getInstructorIncome(Long instructorId, int page, int pageSize);

    Page<InstructorCurrentMonthEarning> getAllInstructorsCurrentMonthEarning(int page, int pageSize, String search, String sortBy, String sortOrder);

    Page<InstructorMonthlyEarningResponse> getInstructorsMonthlyEarnings(Integer year, Integer month, EarningStatus paymentStatus, int page, int pageSize, String sortBy, String sortOrder);

    InstructorMonthlyEarningResponse updatePaymentStatus(Long earningId, EarningStatus paymentStatus);
}
