package com.ptit.onlinelearning.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.common.type.RoleName;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "users_id_gen")
    @SequenceGenerator(name = "users_id_gen", sequenceName = "user_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "password")
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "provider")
    private String provider;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private Boolean isActive = false;

    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default false")
    private Boolean emailVerified = false;

    @Column(name = "phone_verified")
    private Boolean phoneVerified;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    private Instructor instructor;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @JsonIgnore
    private List<LessonProgress> lessonProgresses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Review> reviews;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private Set<PreOrderEnrollment> preOrderEnrollments = new HashSet<>();


    @OneToMany(mappedBy = "user")
    @ToString.Exclude
    private Set<UserRole> userRoles;

    public String getName(){
        return firstName + " " + lastName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Avoid calling isEmpty() or any method that triggers lazy loading
        try {
            if (userRoles == null) {
                return List.of();
            }
            
            // Create defensive copy from the Set - this might trigger loading but safer
            List<UserRole> rolesList = new ArrayList<>(userRoles);
            if (rolesList.isEmpty()) {
                return List.of();
            }
            
            return rolesList.stream()
                    .map(userRole -> (GrantedAuthority) () -> "ROLE_" + userRole.getRole().getName())
                    .toList();
        } catch (Exception e) {
            // If any lazy loading issues occur, return empty list
            return List.of();
        }
    }
    
    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public boolean hasAdminRole(){
        for (UserRole userRole : userRoles){
            if(userRole.getRole().getName() == RoleName.ADMIN){
                return true;
            }
        }
        return false;
    }
}
