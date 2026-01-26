package com.ptit.onlinelearning.service.role;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.model.Role;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;
import com.ptit.onlinelearning.repository.RoleRepository;
import com.ptit.onlinelearning.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService implements IRoleService {
    
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    public static final String DEFAULT_STUDENT_ROLE = "STUDENT";
    public static final String DEFAULT_TEACHER_ROLE = "INSTRUCTOR";
    public static final String DEFAULT_ADMIN_ROLE = "ADMIN";
    
    @Override
    public Optional<Role> findRoleByName(String name) {
        return roleRepository.findByName(RoleName.valueOf(name));
    }
    
    @Override
    @Transactional
    public Role createRole(String name) {
        if (roleRepository.existsByName(RoleName.valueOf(name))) {
            throw new RuntimeException("Role with name '" + name + "' already exists");
        }
        Role role = new Role();
        role.setName(RoleName.valueOf(name));
        return roleRepository.save(role);
    }
    
    @Override
    @Transactional
    public UserRole assignRoleToUser(User user, Role role) {
        if (userRoleRepository.existsByUserIdAndRoleId(user.getId(), role.getId())) {
            log.warn("User {} already has role {}", user.getId(), role.getName());
            return userRoleRepository.findByUserIdAndRoleId(user.getId(), role.getId()).orElse(null);
        }
        
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        return userRoleRepository.save(userRole);
    }
    
    @Override
    @Transactional
    public UserRole assignDefaultStudentRole(User user) {
        Optional<Role> studentRole = findRoleByName(DEFAULT_STUDENT_ROLE);
        
        if (studentRole.isEmpty()) {
            Role newStudentRole = createRole(DEFAULT_STUDENT_ROLE);
            return assignRoleToUser(user, newStudentRole);
        }
        
        return assignRoleToUser(user, studentRole.get());
    }

    @Transactional
    public UserRole assignDefaultTeacherRole(User user) {
        Optional<Role> teacherRole = findRoleByName(DEFAULT_TEACHER_ROLE);

        if (teacherRole.isEmpty()) {
            Role newTeacherRole = createRole(DEFAULT_TEACHER_ROLE);
            return assignRoleToUser(user, newTeacherRole);
        }

        return assignRoleToUser(user, teacherRole.get());
    }
    
    @Override
    @Transactional
    public UserRole assignRoleByName(User user, String roleName) {
        Optional<Role> role = findRoleByName(roleName);
        if (role.isEmpty()) {
            Role newRole = createRole(roleName);
            return assignRoleToUser(user, newRole);
        }
        
        return assignRoleToUser(user, role.get());
    }
    
    @Override
    public List<UserRole> getUserRoles(Long userId) {
        return userRoleRepository.findByUserIdWithRole(userId);
    }
    
    @Override
    public boolean userHasRole(Long userId, String roleName) {
        List<UserRole> userRoles = getUserRoles(userId);
        return userRoles.stream()
                .anyMatch(userRole -> userRole.getRole().getName().equals(RoleName.valueOf(roleName)));
    }
    
    @Override
    @Transactional
    public void removeRoleFromUser(Long userId, Integer roleId) {
        Optional<UserRole> userRole = userRoleRepository.findByUserIdAndRoleId(userId, roleId);
        if (userRole.isPresent()) {
            userRoleRepository.delete(userRole.get());
            log.info("Removed role {} from user {}", roleId, userId);
        }
    }
    
    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
