package com.ptit.onlinelearning.service.user;

import com.ptit.onlinelearning.request.UpdateInstructorRequest;
import com.ptit.onlinelearning.request.UpdateUserRequest;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.UpdateInstructorResponse;
import com.ptit.onlinelearning.response.UserResponse;
import org.springframework.data.domain.Page;

public interface IUserService {
    User getUserDetailFromToken(String token);

    Instructor becomeInstructor(User user);

    UserResponse updateProfile(Long userId, UpdateUserRequest updateUserRequest);
    
    User findById(Long id);


    UserResponse getMe(String token);

    UpdateInstructorResponse updateInstructorProfile(Long userId, UpdateInstructorRequest updateInstructorRequest);

    Page<UserResponse> getAllStudentsForAdmin(int page, int pageSize, String search, String sortBy, String sortOrder);
}
