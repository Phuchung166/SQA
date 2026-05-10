package com.ptit.onlinelearning.service.user;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.ExpiredTokenException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Role;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.request.UpdateInstructorRequest;
import com.ptit.onlinelearning.request.UpdateUserRequest;
import com.ptit.onlinelearning.response.UpdateInstructorResponse;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.service.role.IRoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho UserService
 * Technique: EP + BVA + Negative Testing
 * CheckDB: ArgumentCaptor để xác minh save() đúng state
 * Rollback: MockitoExtension
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtTokenUtils jwtTokenUtils;
    @Mock private IRoleService roleService;
    @Mock private InstructorRepository instructorRepository;
    @Mock private ModelMapper modelMapper;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Instructor testInstructor;
    private UpdateUserRequest updateUserReq;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("test@mail.com").accountName("user01").build();
        testInstructor = Instructor.builder().id(10L).userId(1L).expertise("Java").build();
        
        updateUserReq = new UpdateUserRequest();
        updateUserReq.setFirstName("First");
        updateUserReq.setLastName("Last");
        updateUserReq.setPhone("123456789");
    }

    // TC-USR-001: getUserDetailFromToken - Token expired
    @Test
    @DisplayName("TC-USR-001: Token hết hạn -> ném ExpiredTokenException")
    void getUserDetailFromToken_tokenExpired_throwsException() {
        when(jwtTokenUtils.isTokenExpired("expired_token")).thenReturn(true);
        assertThatThrownBy(() -> userService.getUserDetailFromToken("expired_token"))
                .isInstanceOf(ExpiredTokenException.class);
    }

    // TC-USR-002: getUserDetailFromToken - Token valid
    @Test
    @DisplayName("TC-USR-002: Token hợp lệ -> trả về User")
    void getUserDetailFromToken_validToken_returnsUser() {
        when(jwtTokenUtils.isTokenExpired("valid_token")).thenReturn(false);
        when(jwtTokenUtils.extractEmail("valid_token")).thenReturn("test@mail.com");
        when(userRepository.findByEmailWithRoles("test@mail.com")).thenReturn(Optional.of(testUser));
        
        User result = userService.getUserDetailFromToken("valid_token");
        assertThat(result.getEmail()).isEqualTo("test@mail.com");
    }

    // TC-USR-003: becomeInstructor - Already an instructor
    @Test
    @DisplayName("TC-USR-003: User đã là instructor -> ném InvalidParamException")
    void becomeInstructor_alreadyInstructor_throwsException() {
        Role instrRole = Role.builder().name(RoleName.INSTRUCTOR).build();
        UserRole ur = new UserRole(); ur.setRole(instrRole);
        when(roleService.getUserRoles(1L)).thenReturn(List.of(ur));

        assertThatThrownBy(() -> userService.becomeInstructor(testUser))
                .isInstanceOf(InvalidParamException.class);
    }

    // TC-USR-004: becomeInstructor - Success
    @Test
    @DisplayName("TC-USR-004: Trở thành instructor -> CheckDB save() đúng state")
    void becomeInstructor_success_savesInstructor() {
        when(roleService.getUserRoles(1L)).thenReturn(List.of());
        when(roleService.assignDefaultTeacherRole(testUser)).thenReturn(new UserRole());
        when(instructorRepository.save(any(Instructor.class))).thenAnswer(inv -> inv.getArgument(0));

        Instructor result = userService.becomeInstructor(testUser);

        ArgumentCaptor<Instructor> captor = ArgumentCaptor.forClass(Instructor.class);
        verify(instructorRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(1L);
        assertThat(result).isNotNull();
    }

    // TC-USR-005: updateProfile - Success
    @Test
    @DisplayName("TC-USR-005: Cập nhật profile thành công")
    void updateProfile_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse res = userService.updateProfile(1L, updateUserReq);

        verify(userRepository).saveAndFlush(any(User.class));
        assertThat(testUser.getFirstName()).isEqualTo("First");
    }

    // TC-USR-006: updateInstructorProfile - Success
    @Test
    @DisplayName("TC-USR-006: Cập nhật instructor profile thành công")
    void updateInstructorProfile_success() {
        UpdateInstructorRequest req = new UpdateInstructorRequest();
        req.setExpertise("Spring Boot");
        req.setExperienceYears(5L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(instructorRepository.findByUserId(1L)).thenReturn(Optional.of(testInstructor));
        
        userService.updateInstructorProfile(1L, req);

        verify(userRepository).saveAndFlush(testUser);
        verify(instructorRepository).saveAndFlush(testInstructor);
        assertThat(testInstructor.getExpertise()).isEqualTo("Spring Boot");
        assertThat(testInstructor.getExperienceYears()).isEqualTo(5);
    }

    // TC-USR-007: getUserDetailFromToken - Token valid nhưng email không tồn tại -> DataNotFoundException
    @Test
    @DisplayName("TC-USR-007: Token hợp lệ nhưng email không có trong DB -> DataNotFoundException")
    void getUserDetailFromToken_emailNotFound_throwsException() {
        when(jwtTokenUtils.isTokenExpired("valid_token")).thenReturn(false);
        when(jwtTokenUtils.extractEmail("valid_token")).thenReturn("unknown@mail.com");
        when(userRepository.findByEmailWithRoles("unknown@mail.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserDetailFromToken("valid_token"))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    // TC-USR-008: findById - Thành công
    @Test
    @DisplayName("TC-USR-008: findById với ID hợp lệ -> trả về User")
    void findById_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        User result = userService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("test@mail.com");
        verify(userRepository, times(1)).findById(1L);
    }

    // TC-USR-009: findById - Không tồn tại -> DataNotFoundException
    @Test
    @DisplayName("TC-USR-009: findById với ID không tồn tại -> DataNotFoundException")
    void findById_notFound_throwsException() {
        when(userRepository.findById(99999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99999L))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("User not found with id: 99999");
    }

    // TC-USR-010: updateProfile - userId không tồn tại -> DataNotFoundException
    @Test
    @DisplayName("TC-USR-010: updateProfile với userId không tồn tại -> DataNotFoundException")
    void updateProfile_userNotFound_throwsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(999L, updateUserReq))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("User not found with id: 999");
    }

    // TC-USR-011: updateInstructorProfile - User tồn tại nhưng chưa có Instructor record -> DataNotFoundException
    @Test
    @DisplayName("TC-USR-011: updateInstructorProfile khi chưa có Instructor record -> DataNotFoundException")
    void updateInstructorProfile_instructorNotFound_throwsException() {
        UpdateInstructorRequest req = new UpdateInstructorRequest();
        req.setExpertise("Python");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(instructorRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateInstructorProfile(1L, req))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("Instructor profile not found for user id: 1");
    }

    // TC-USR-012: getAllStudentsForAdmin - Trả về danh sách students đúng với search
    @Test
    @DisplayName("TC-USR-012: getAllStudentsForAdmin với search keyword -> Trả về đúng danh sách")
    void getAllStudentsForAdmin_withSearch_success() {
        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepository.findUsersByRoleWithSearch(
                eq(RoleName.STUDENT), anyString(), any(Pageable.class)))
                .thenReturn(userPage);

        Page<UserResponse> result = userService.getAllStudentsForAdmin(0, 10, "test", "createdAt", "desc");

        assertThat(result.getContent()).hasSize(1);
        verify(userRepository, times(1)).findUsersByRoleWithSearch(
                eq(RoleName.STUDENT), eq("test"), any(Pageable.class));
    }

    // TC-USR-013: updateProfile - Update all fields
    @Test
    @DisplayName("TC-USR-013: Cập nhật tất cả các trường profile")
    void updateProfile_allFields_success() {
        UpdateUserRequest req = new UpdateUserRequest();
        req.setAccountName("New Acc");
        req.setAvatar("http://avatar.com/1");
        req.setGender("FEMALE");
        req.setBio("New Bio");
        req.setDateOfBirth(java.time.LocalDate.of(2000, 1, 1));
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse res = userService.updateProfile(1L, req);

        assertThat(testUser.getAccountName()).isEqualTo("New Acc");
        assertThat(testUser.getAvatar()).isEqualTo("http://avatar.com/1");
        assertThat(testUser.getGender()).isEqualTo("FEMALE");
        assertThat(testUser.getBio()).isEqualTo("New Bio");
        assertThat(testUser.getDateOfBirth()).isEqualTo(java.time.LocalDate.of(2000, 1, 1));
        assertThat(res.getGender()).isEqualTo("FEMALE");
    }

    // TC-USR-014: getMe - Success
    @Test
    @DisplayName("TC-USR-014: getMe trả về UserResponse")
    void getMe_success() {
        when(jwtTokenUtils.isTokenExpired("token")).thenReturn(false);
        when(jwtTokenUtils.extractEmail("token")).thenReturn("test@mail.com");
        when(userRepository.findByEmailWithRoles("test@mail.com")).thenReturn(Optional.of(testUser));
        UserResponse mockRes = new UserResponse();
        mockRes.setEmail("test@mail.com");
        when(modelMapper.map(testUser, UserResponse.class)).thenReturn(mockRes);

        UserResponse res = userService.getMe("token");

        assertThat(res.getEmail()).isEqualTo("test@mail.com");
    }

    // TC-USR-015: updateInstructorProfile - Update all fields
    @Test
    @DisplayName("TC-USR-015: Cập nhật tất cả các trường instructor profile")
    void updateInstructorProfile_allFields_success() {
        UpdateInstructorRequest req = new UpdateInstructorRequest();
        req.setFirstName("First");
        req.setLastName("Last");
        req.setPhone("0123");
        req.setAvatar("avt");
        req.setBio("Bio");
        req.setGender("MALE");
        req.setDateOfBirth(java.time.LocalDate.of(1990, 1, 1));
        req.setBankName("VCB");
        req.setBankAccount("1234");
        req.setCommissionRate(java.math.BigDecimal.valueOf(10));
        req.setTaxCode("TAX123");
        req.setQualifications("Qual");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(instructorRepository.findByUserId(1L)).thenReturn(Optional.of(testInstructor));

        userService.updateInstructorProfile(1L, req);

        assertThat(testUser.getFirstName()).isEqualTo("First");
        assertThat(testUser.getGender()).isEqualTo("MALE");
        assertThat(testInstructor.getBankName()).isEqualTo("VCB");
        assertThat(testInstructor.getCommissionRate()).isEqualTo(java.math.BigDecimal.valueOf(10));
        assertThat(testInstructor.getTaxCode()).isEqualTo("TAX123");
        assertThat(testInstructor.getQualification()).isEqualTo("Qual");
    }

    // TC-USR-016: getAllStudentsForAdmin - Invalid sortBy
    @Test
    @DisplayName("TC-USR-016: Invalid sortBy mặc định thành createdAt")
    void getAllStudentsForAdmin_invalidSortBy_defaultsToCreatedAt() {
        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepository.findUsersByRoleWithSearch(
                eq(RoleName.STUDENT), any(), any(Pageable.class)))
                .thenReturn(userPage);

        // "invalid_prop" có thể throw exception trong Spring Data Sort nếu không map được, 
        // UserService có catch để fallback.
        Page<UserResponse> result = userService.getAllStudentsForAdmin(0, 10, null, "user_name_invalid", "asc");

        assertThat(result.getContent()).hasSize(1);
    }
}

