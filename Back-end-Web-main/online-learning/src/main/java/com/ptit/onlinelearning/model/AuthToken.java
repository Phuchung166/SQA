package com.ptit.onlinelearning.model;

import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auth_tokens")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthToken extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "access_token", nullable = false, length = 255)
    private String accessToken;

    @Column(name = "refresh_token", nullable = false, length = 255)
    private String refreshToken;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
