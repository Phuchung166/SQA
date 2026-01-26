package com.ptit.onlinelearning.service.role;

import com.ptit.onlinelearning.model.Role;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;

import java.util.List;
import java.util.Optional;

public interface IRoleService {
    
    /**
     * Tìm role theo tên
     */
    Optional<Role> findRoleByName(String name);
    
    /**
     * Tạo role mới
     */
    Role createRole(String name);
    
    /**
     * Gán role cho user
     */
    UserRole assignRoleToUser(User user, Role role);
    
    /**
     * Gán role mặc định STUDENT cho user
     */
    UserRole assignDefaultStudentRole(User user);

    UserRole assignDefaultTeacherRole(User user);
    
    /**
     * Gán role cho user theo tên role
     */
    UserRole assignRoleByName(User user, String roleName);
    
    /**
     * Lấy tất cả roles của user
     */
    List<UserRole> getUserRoles(Long userId);
    
    /**
     * Kiểm tra user có role cụ thể không
     */
    boolean userHasRole(Long userId, String roleName);
    
    /**
     * Xóa role khỏi user
     */
    void removeRoleFromUser(Long userId, Integer roleId);
    
    /**
     * Lấy tất cả roles trong hệ thống
     */
    List<Role> getAllRoles();
}
