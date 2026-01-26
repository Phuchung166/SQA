package com.ptit.onlinelearning.service.user;

import com.ptit.onlinelearning.common.type.Gender;
import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.request.UpdateInstructorRequest;
import com.ptit.onlinelearning.request.UpdateUserRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.ExpiredTokenException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.response.UpdateInstructorResponse;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.service.role.IRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

import java.util.List;
import java.util.Optional;

import static com.ptit.onlinelearning.response.UpdateInstructorResponse.mapToUpdateInstructorResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final JwtTokenUtils jwtTokenUtils;
    private final IRoleService roleService;
    private final InstructorRepository instructorRepository;
    private final ModelMapper modelMapper;
    private final IRoleService iRoleService;

    @Transactional(readOnly = true)
    public User getUserDetailFromToken(String token) {
        if (jwtTokenUtils.isTokenExpired(token)) {
            throw new ExpiredTokenException("Token is expired");
        }

        String email = jwtTokenUtils.extractEmail(token);

        return userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
    }


    @Override
    @Transactional
    public Instructor becomeInstructor(User user) {
        List<UserRole> userRoles = iRoleService.getUserRoles(user.getId());
        boolean isInstructor = userRoles.stream()
                .anyMatch(ur -> ur.getRole().getName().equals(RoleName.INSTRUCTOR));
        if (isInstructor) {
            throw new InvalidParamException("User is already an instructor");
        }
        UserRole userRole = roleService.assignDefaultTeacherRole(user);
        Instructor newInstructor = Instructor.builder()
                .userId(user.getId())
                .slug(user.getAccountName()+"-"+ UUID.randomUUID())
                .build();
        return instructorRepository.save(newInstructor);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateUserRequest updateUserRequest) {
        log.info("Updating user profile for user ID: {}", userId);
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found with id: " + userId));

        if (updateUserRequest.getPhone() != null && !updateUserRequest.getPhone().trim().isEmpty()) {
            existingUser.setPhone(updateUserRequest.getPhone().trim());
        }

        if (updateUserRequest.getFirstName() != null && !updateUserRequest.getFirstName().trim().isEmpty()) {
            existingUser.setFirstName(updateUserRequest.getFirstName().trim());
        }

        if (updateUserRequest.getLastName() != null && !updateUserRequest.getLastName().trim().isEmpty()) {
            existingUser.setLastName(updateUserRequest.getLastName().trim());
        }
        if(updateUserRequest.getAccountName() != null && !updateUserRequest.getAccountName().trim().isEmpty()) {
            existingUser.setAccountName(updateUserRequest.getAccountName().trim());
        }

        if (updateUserRequest.getAvatar() != null && !updateUserRequest.getAvatar().trim().isEmpty()) {
            existingUser.setAvatar(updateUserRequest.getAvatar().trim());
        }

        if (updateUserRequest.getGender() != null && !updateUserRequest.getGender().trim().isEmpty()) {
            String gender = updateUserRequest.getGender().toUpperCase();
            existingUser.setGender(gender);

        }
        if (updateUserRequest.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(updateUserRequest.getDateOfBirth());
        }

        if (updateUserRequest.getBio() != null) {
            existingUser.setBio(updateUserRequest.getBio().trim());
        }

        User savedUser = userRepository.saveAndFlush(existingUser);

        log.info("User profile updated successfully for user ID: {}", userId);

        UserResponse userResponse = UserResponse.fromEntity(savedUser);

        if (savedUser.getDateOfBirth() != null) {
            userResponse.setDateOfBirth(savedUser.getDateOfBirth());
        }

        if (savedUser.getGender() != null) {
            userResponse.setGender(savedUser.getGender());
        }
        return userResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMe(String token) {
        User userResult = getUserDetailFromToken(token);
        return modelMapper.map(userResult, UserResponse.class);
    }

    @Override
    @Transactional
    public UpdateInstructorResponse updateInstructorProfile(Long userId, UpdateInstructorRequest updateInstructorRequest) {
        log.info("Updating instructor profile for user ID: {}", userId);
        
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found with id: " + userId));
        
        Instructor existingInstructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new DataNotFoundException("Instructor profile not found for user id: " + userId));
        
        if (updateInstructorRequest.getFirstName() != null && !updateInstructorRequest.getFirstName().trim().isEmpty()) {
            existingUser.setFirstName(updateInstructorRequest.getFirstName().trim());
        }
        
        if (updateInstructorRequest.getLastName() != null && !updateInstructorRequest.getLastName().trim().isEmpty()) {
            existingUser.setLastName(updateInstructorRequest.getLastName().trim());
        }
        
        if (updateInstructorRequest.getPhone() != null && !updateInstructorRequest.getPhone().trim().isEmpty()) {
            existingUser.setPhone(updateInstructorRequest.getPhone().trim());
        }
        
        if (updateInstructorRequest.getAvatar() != null && !updateInstructorRequest.getAvatar().trim().isEmpty()) {
            existingUser.setAvatar(updateInstructorRequest.getAvatar().trim());
        }
        
        if (updateInstructorRequest.getBio() != null && !updateInstructorRequest.getBio().trim().isEmpty()) {
            existingUser.setBio(updateInstructorRequest.getBio().trim());
        }
        
        if (updateInstructorRequest.getGender() != null && !updateInstructorRequest.getGender().trim().isEmpty()) {
                String gender = updateInstructorRequest.getGender().toUpperCase();
                existingUser.setGender(gender);
        }
        
        if (updateInstructorRequest.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(updateInstructorRequest.getDateOfBirth());
        }
        
        if (updateInstructorRequest.getExpertise() != null && !updateInstructorRequest.getExpertise().trim().isEmpty()) {
            existingInstructor.setExpertise(updateInstructorRequest.getExpertise().trim());
        }
        
        if (updateInstructorRequest.getExperienceYears() != null) {
            existingInstructor.setExperienceYears(updateInstructorRequest.getExperienceYears().intValue());
        }

        if( updateInstructorRequest.getBankName() != null && !updateInstructorRequest.getBankName().trim().isEmpty()) {
            existingInstructor.setBankName(updateInstructorRequest.getBankName().trim());
        }
        if(updateInstructorRequest.getBankAccount() != null){
            existingInstructor.setBankAccount(updateInstructorRequest.getBankAccount().trim());
        }
        if(updateInstructorRequest.getCommissionRate() != null){
            existingInstructor.setCommissionRate(updateInstructorRequest.getCommissionRate());
        }
        if(updateInstructorRequest.getTaxCode() != null){
            existingInstructor.setTaxCode(updateInstructorRequest.getTaxCode().trim());
        }
        if (updateInstructorRequest.getQualifications() != null && !updateInstructorRequest.getQualifications().trim().isEmpty()) {
            existingInstructor.setQualification(updateInstructorRequest.getQualifications().trim());
        }
        
        userRepository.saveAndFlush(existingUser);
        instructorRepository.saveAndFlush(existingInstructor);
        
        log.info("Instructor profile updated successfully for user ID: {}", userId);
        
        return mapToUpdateInstructorResponse(existingUser, existingInstructor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllStudentsForAdmin(int page, int pageSize, String search, String sortBy, String sortOrder) {
        log.info("Getting all students for admin - page: {}, pageSize: {}, search: {}, sortBy: {}, sortOrder: {}", 
                page, pageSize, search, sortBy, sortOrder);
        
        // Create sort direction
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        // Create sort object - default to createdAt if sortBy is invalid
        Sort sort;
        try {
            sort = Sort.by(direction, sortBy);
        } catch (Exception e) {
            log.warn("Invalid sortBy field: {}, defaulting to createdAt", sortBy);
            sort = Sort.by(direction, "createdAt");
        }
        
        // Create pageable
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        
        // Get users with STUDENT role
        Page<User> usersPage = userRepository.findUsersByRoleWithSearch(
            RoleName.STUDENT,
            search, 
            pageable
        );
        
        // Convert to UserResponse
        Page<UserResponse> userResponsePage = usersPage.map(UserResponse::fromEntity);
        
        log.info("Found {} students for admin", userResponsePage.getTotalElements());
        
        return userResponsePage;
    }


}
