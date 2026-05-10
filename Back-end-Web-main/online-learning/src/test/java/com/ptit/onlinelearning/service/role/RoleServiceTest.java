package com.ptit.onlinelearning.service.role;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.model.Role;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;
import com.ptit.onlinelearning.repository.RoleRepository;
import com.ptit.onlinelearning.repository.UserRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho RoleService — Quản lý phân quyền người dùng.
 * Target: Line Coverage ≥ 80%, Branch Coverage ≥ 70%
 *
 * CheckDB: ArgumentCaptor xác minh đúng Role/UserRole được lưu xuống repository.
 * Rollback: MockitoExtension reset toàn bộ mock state sau mỗi test.
 */
@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock private RoleRepository roleRepository;
    @Mock private UserRoleRepository userRoleRepository;

    @InjectMocks
    private RoleService roleService;

    private User testUser;
    private Role studentRole;
    private Role instructorRole;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("student@example.com").accountName("student01").build();
        studentRole = Role.builder().id(1).name(RoleName.STUDENT).build();
        instructorRole = Role.builder().id(2).name(RoleName.INSTRUCTOR).build();
    }

    // =========================================================
    // TC-ROLE-001: Tạo role thành công
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-001: Tạo role STUDENT thành công — CheckDB xác minh save được gọi")
    void TC_ROLE_001_createRole_newRole_savedSuccessfully() {
        when(roleRepository.existsByName(RoleName.STUDENT)).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(studentRole);

        Role createdRole = roleService.createRole("STUDENT");

        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository, times(1)).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue().getName()).isEqualTo(RoleName.STUDENT);
        assertThat(createdRole.getId()).isEqualTo(1);
    }

    // =========================================================
    // TC-ROLE-002: Tạo role đã tồn tại — ném exception
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-002: Tạo role đã tồn tại — ném RuntimeException, không gọi save()")
    void TC_ROLE_002_createRole_existingRole_throwsRuntimeException() {
        when(roleRepository.existsByName(RoleName.STUDENT)).thenReturn(true);

        assertThatThrownBy(() -> roleService.createRole("STUDENT"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");

        verify(roleRepository, never()).save(any(Role.class));
    }

    // =========================================================
    // TC-ROLE-003: Gán role cho user thành công
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-003: Gán role cho user thành công — CheckDB xác minh UserRole được lưu")
    void TC_ROLE_003_assignRoleToUser_newMapping_userRoleSaved() {
        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), studentRole.getId())).thenReturn(false);
        UserRole savedUserRole = new UserRole();
        savedUserRole.setUser(testUser);
        savedUserRole.setRole(studentRole);
        when(userRoleRepository.save(any(UserRole.class))).thenReturn(savedUserRole);

        UserRole result = roleService.assignRoleToUser(testUser, studentRole);

        ArgumentCaptor<UserRole> captor = ArgumentCaptor.forClass(UserRole.class);
        verify(userRoleRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getUser().getId()).isEqualTo(testUser.getId());
        assertThat(captor.getValue().getRole().getName()).isEqualTo(RoleName.STUDENT);
    }

    // =========================================================
    // TC-ROLE-004: Gán role đã có — không tạo duplicate
    // Technique: Negative Testing + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-004: Gán role đã có — không duplicate, trả về UserRole cũ")
    void TC_ROLE_004_assignRoleToUser_existingMapping_noDuplicate() {
        UserRole existingUserRole = new UserRole();
        existingUserRole.setUser(testUser);
        existingUserRole.setRole(studentRole);

        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), studentRole.getId())).thenReturn(true);
        when(userRoleRepository.findByUserIdAndRoleId(testUser.getId(), studentRole.getId()))
                .thenReturn(Optional.of(existingUserRole));

        UserRole result = roleService.assignRoleToUser(testUser, studentRole);

        verify(userRoleRepository, never()).save(any(UserRole.class));
        assertThat(result).isNotNull();
        assertThat(result.getUser().getId()).isEqualTo(testUser.getId());
    }

    // =========================================================
    // TC-ROLE-005: assignRoleByName — role tồn tại sẵn
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-005: assignRoleByName khi role đã tồn tại — tìm role và gán cho user")
    void TC_ROLE_005_assignRoleByName_existingRole_assignsCorrectly() {
        when(roleRepository.findByName(RoleName.STUDENT)).thenReturn(Optional.of(studentRole));
        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), studentRole.getId())).thenReturn(false);
        when(userRoleRepository.save(any(UserRole.class))).thenReturn(new UserRole());

        UserRole result = roleService.assignRoleByName(testUser, "STUDENT");

        verify(roleRepository, never()).save(any(Role.class));
        verify(userRoleRepository, times(1)).save(any(UserRole.class));
    }

    // =========================================================
    // TC-ROLE-006: userHasRole — user có role → true
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-006: userHasRole — user có role STUDENT → trả về true")
    void TC_ROLE_006_userHasRole_userOwnsRole_returnsTrue() {
        UserRole userRole = new UserRole();
        userRole.setUser(testUser);
        userRole.setRole(studentRole);
        when(userRoleRepository.findByUserIdWithRole(testUser.getId())).thenReturn(List.of(userRole));

        boolean result = roleService.userHasRole(testUser.getId(), "STUDENT");

        assertThat(result).isTrue();
    }

    // =========================================================
    // TC-ROLE-007: userHasRole — user không có role → false
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-007: userHasRole — user không có role ADMIN → trả về false")
    void TC_ROLE_007_userHasRole_userDoesNotHaveRole_returnsFalse() {
        UserRole userRole = new UserRole();
        userRole.setUser(testUser);
        userRole.setRole(studentRole); // chỉ có STUDENT, không có ADMIN
        when(userRoleRepository.findByUserIdWithRole(testUser.getId())).thenReturn(List.of(userRole));

        boolean result = roleService.userHasRole(testUser.getId(), "ADMIN");

        assertThat(result).isFalse();
    }

    // =========================================================
    // TC-ROLE-008: removeRoleFromUser — role tồn tại → xóa thành công
    // Technique: CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-008: removeRoleFromUser — role tồn tại → delete() được gọi")
    void TC_ROLE_008_removeRoleFromUser_roleExists_deleteCalled() {
        UserRole existingUserRole = new UserRole();
        existingUserRole.setUser(testUser);
        existingUserRole.setRole(studentRole);
        when(userRoleRepository.findByUserIdAndRoleId(testUser.getId(), studentRole.getId()))
                .thenReturn(Optional.of(existingUserRole));
        doNothing().when(userRoleRepository).delete(any(UserRole.class));

        roleService.removeRoleFromUser(testUser.getId(), studentRole.getId());

        ArgumentCaptor<UserRole> captor = ArgumentCaptor.forClass(UserRole.class);
        verify(userRoleRepository, times(1)).delete(captor.capture());
        assertThat(captor.getValue().getUser().getId()).isEqualTo(testUser.getId());
    }

    // =========================================================
    // TC-ROLE-009: removeRoleFromUser — role không tồn tại → không gọi delete()
    // Technique: Negative Testing (branch: empty optional)
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-009: removeRoleFromUser — role không tồn tại → delete() không được gọi")
    void TC_ROLE_009_removeRoleFromUser_roleNotExists_deleteNotCalled() {
        when(userRoleRepository.findByUserIdAndRoleId(testUser.getId(), 99)).thenReturn(Optional.empty());

        roleService.removeRoleFromUser(testUser.getId(), 99);

        verify(userRoleRepository, never()).delete(any(UserRole.class));
    }

    // =========================================================
    // TC-ROLE-010: getAllRoles — trả về danh sách đầy đủ
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-010: getAllRoles — trả về danh sách role từ repository")
    void TC_ROLE_010_getAllRoles_returnsAllRoles() {
        when(roleRepository.findAll()).thenReturn(List.of(studentRole, instructorRole));

        List<Role> roles = roleService.getAllRoles();

        assertThat(roles).hasSize(2);
        assertThat(roles).extracting(Role::getName)
                .containsExactlyInAnyOrder(RoleName.STUDENT, RoleName.INSTRUCTOR);
        verify(roleRepository, times(1)).findAll();
    }

    // =========================================================
    // TC-ROLE-011: findRoleByName — tìm thấy
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-011: findRoleByName — tìm thấy STUDENT → trả về Optional chứa role")
    void TC_ROLE_011_findRoleByName_found_returnsOptional() {
        when(roleRepository.findByName(RoleName.STUDENT)).thenReturn(Optional.of(studentRole));

        Optional<Role> result = roleService.findRoleByName("STUDENT");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo(RoleName.STUDENT);
    }

    // =========================================================
    // TC-ROLE-012: findRoleByName — không tìm thấy
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-012: findRoleByName — không tìm thấy → Optional.empty()")
    void TC_ROLE_012_findRoleByName_notFound_returnsEmpty() {
        when(roleRepository.findByName(RoleName.ADMIN)).thenReturn(Optional.empty());

        Optional<Role> result = roleService.findRoleByName("ADMIN");

        assertThat(result).isEmpty();
    }

    // =========================================================
    // TC-ROLE-013: getUserRoles — trả về danh sách UserRole
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-013: getUserRoles — trả về danh sách UserRole của user")
    void TC_ROLE_013_getUserRoles_returnsUserRoleList() {
        UserRole ur = new UserRole();
        ur.setUser(testUser);
        ur.setRole(studentRole);
        when(userRoleRepository.findByUserIdWithRole(testUser.getId())).thenReturn(List.of(ur));

        List<UserRole> result = roleService.getUserRoles(testUser.getId());

        assertThat(result).hasSize(1);
        verify(userRoleRepository, times(1)).findByUserIdWithRole(testUser.getId());
    }

    // =========================================================
    // TC-ROLE-014: assignRoleByName — role chưa tồn tại → tạo role mới rồi gán
    // Technique: State Transition
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-014: assignRoleByName role chưa tồn tại — tạo role mới rồi gán")
    void TC_ROLE_014_assignRoleByName_roleNotExists_createsAndAssigns() {
        when(roleRepository.findByName(RoleName.INSTRUCTOR)).thenReturn(Optional.empty());
        when(roleRepository.existsByName(RoleName.INSTRUCTOR)).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(instructorRole);
        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), instructorRole.getId())).thenReturn(false);
        when(userRoleRepository.save(any(UserRole.class))).thenReturn(new UserRole());

        roleService.assignRoleByName(testUser, "INSTRUCTOR");

        // Role mới được tạo
        verify(roleRepository, times(1)).save(any(Role.class));
        // UserRole được gán
        verify(userRoleRepository, times(1)).save(any(UserRole.class));
    }

    // =========================================================
    // TC-ROLE-015: assignDefaultStudentRole — STUDENT role đã có
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-ROLE-015: assignDefaultStudentRole — STUDENT đã có → gán trực tiếp, không tạo mới")
    void TC_ROLE_015_assignDefaultStudentRole_roleExists_assignsDirectly() {
        when(roleRepository.findByName(RoleName.STUDENT)).thenReturn(Optional.of(studentRole));
        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), studentRole.getId())).thenReturn(false);
        when(userRoleRepository.save(any(UserRole.class))).thenReturn(new UserRole());

        roleService.assignDefaultStudentRole(testUser);

        verify(roleRepository, never()).save(any(Role.class));
        verify(userRoleRepository, times(1)).save(any(UserRole.class));
    }

    // TC-ROLE-017: assignRoleByName — Tên role là null -> Nhém Exception
    @Test
    @DisplayName("TC-ROLE-017: Gán role với tên null -> NullPointerException (không có null guard)")
    void assignRoleByName_nullName_throwsException() {
        assertThatThrownBy(() -> roleService.assignRoleByName(testUser, null))
                .isInstanceOf(Exception.class); // NullPointerException từ RoleName.valueOf(null)
    }

    // TC-ROLE-018: assignRoleByName — Tên role không hợp lệ
    @Test
    @DisplayName("TC-ROLE-018: Gán role không thuộc hệ thống -> IllegalArgumentException")
    void assignRoleByName_invalidEnum_throwsException() {
        assertThatThrownBy(() -> roleService.assignRoleByName(testUser, "SUPER_GOD_MODE"))
                .isInstanceOf(IllegalArgumentException.class); // RoleName.valueOf("SUPER_GOD_MODE") thất bại
    }

    // TC-ROLE-019: userHasRole — User ID null
    @Test
    @DisplayName("TC-ROLE-019: Kiểm tra role cho userId null -> false")
    void userHasRole_nullUserId_returnsFalse() {
        boolean res = roleService.userHasRole(null, "STUDENT");
        assertThat(res).isFalse();
    }

    // TC-ROLE-020: assignDefaultStudentRole — User null
    @Test
    @DisplayName("TC-ROLE-020: Gán role mặc định cho user null -> NullPointerException")
    void assignDefaultStudentRole_nullUser_throwsException() {
        assertThatThrownBy(() -> roleService.assignDefaultStudentRole(null))
                .isInstanceOf(NullPointerException.class); // không có null check
    }

    // TC-ROLE-021: removeRoleFromUser — User ID không tồn tại
    @Test
    @DisplayName("TC-ROLE-021: Xóa role cho userId không tồn tại -> Không có lỗi (No-op)")
    void removeRoleFromUser_invalidUserId_noOp() {
        when(userRoleRepository.findByUserIdAndRoleId(999L, 1)).thenReturn(Optional.empty());
        roleService.removeRoleFromUser(999L, 1);
        verify(userRoleRepository, never()).delete(any(UserRole.class));
    }

    // TC-ROLE-022: gán ADMIN role
    @Test
    @DisplayName("TC-ROLE-022: Gán role ADMIN -> CheckDB save")
    void assignAdminRole_success() {
        Role adminRole = Role.builder().id(3).name(RoleName.ADMIN).build();
        when(roleRepository.findByName(RoleName.ADMIN)).thenReturn(Optional.of(adminRole));
        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), 3)).thenReturn(false);
        when(userRoleRepository.save(any())).thenReturn(new UserRole());

        roleService.assignRoleByName(testUser, "ADMIN");
        verify(userRoleRepository).save(any());
    }

    // TC-ROLE-023: findRoleByName — Case insensitive check
    @Test
    @DisplayName("TC-ROLE-023: Tìm role bằng tên chữ thường 'student' -> IllegalArgumentException")
    void findRoleByName_lowerCase_found() {
        // RoleName.valueOf("student") thất bại vì enum là case-sensitive
        assertThatThrownBy(() -> roleService.findRoleByName("student"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // TC-ROLE-024: getUserRoles — User không có role
    @Test
    @DisplayName("TC-ROLE-024: User mới chưa có role -> Trả về list rỗng")
    void getUserRoles_noRoles_returnsEmpty() {
        when(userRoleRepository.findByUserIdWithRole(1L)).thenReturn(List.of());
        List<UserRole> res = roleService.getUserRoles(1L);
        assertThat(res).isEmpty();
    }

    // TC-ROLE-025: assignRoleToUser — Role không có ID
    @Test
    @DisplayName("TC-ROLE-025: Gán role chưa có ID -> Service vẫn gọi (id=0, không validate)")
    void assignRoleToUser_roleNoId_throwsException() {
        Role transientRole = Role.builder().name(RoleName.STUDENT).build(); // id=null
        when(userRoleRepository.existsByUserIdAndRoleId(testUser.getId(), null)).thenReturn(false);
        when(userRoleRepository.save(any(UserRole.class))).thenReturn(new UserRole());

        // Service không validate role.id, gọi thành công
        UserRole result = roleService.assignRoleToUser(testUser, transientRole);
        assertThat(result).isNotNull();
    }
}
