package com.ptit.onlinelearning.model;

import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@EqualsAndHashCode(onlyExplicitlyIncluded = true,callSuper = false)
@Entity
@Table(name = "orders")
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Order extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    @ToString.Include
    private String orderNumber;

    @Column(name = "currency", columnDefinition = "currency")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @ToString.Include
    private Currency currency = Currency.VND;


    @Column(name = "payment_status", columnDefinition = "payment_status")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;


    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "total_money", nullable = false, precision = 12, scale = 0)
    private BigDecimal totalMoney;


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private Set<OrderItem> orderItems = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private User user;
}
