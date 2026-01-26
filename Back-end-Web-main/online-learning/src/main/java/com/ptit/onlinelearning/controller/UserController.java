package com.ptit.onlinelearning.controller;


import com.fasterxml.jackson.annotation.JsonView;
import com.ptit.onlinelearning.request.UpdateInstructorRequest;
import com.ptit.onlinelearning.request.UpdateUserRequest;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.UpdateInstructorResponse;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.response.view.Views;
import com.ptit.onlinelearning.service.user.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final IUserService userService;


    @GetMapping("/become-to-instructor")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<?> becomeToInstructor(@AuthenticationPrincipal User user) {
        log.info(user.getEmail());
        userService.becomeInstructor(user);
        return ResponseEntity.ok(Map.of(
                "message", "User has been promoted to instructor successfully"
        ));
    }

    @PatchMapping()
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Update user profile", description = "Update user profile information")
    @JsonView(Views.Basic.class)
    public ResponseEntity<UserResponse> updateProfile(
                                                      @RequestBody UpdateUserRequest updateUserRequest,
                                                      @AuthenticationPrincipal User user) {
        UserResponse updateUserResponse = userService.updateProfile(user.getId(), updateUserRequest);
        return ResponseEntity.ok(updateUserResponse);
    }


    @GetMapping("/profile")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get user profile", description = "Retrieve the profile information of the authenticated user")
    @JsonView(Views.Basic.class)
    public ResponseEntity<UserResponse> getUserInfo(@AuthenticationPrincipal User user) {

        User userResult = userService.findById(user.getId());
        UserResponse userResponse = UserResponse.fromEntity(userResult);
        return ResponseEntity.ok(userResponse);
    }

    @PatchMapping("/instructor-profile")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Update instructor profile", 
               description = "Update instructor profile information including both user and instructor specific fields")
    public ResponseEntity<UpdateInstructorResponse> updateInstructorProfile(
            @Valid @RequestBody UpdateInstructorRequest updateInstructorRequest,
            @AuthenticationPrincipal User user) {

        UpdateInstructorResponse updateInstructorResponse = userService.updateInstructorProfile(user.getId(), updateInstructorRequest);
        return ResponseEntity.ok(updateInstructorResponse);
    }
}
