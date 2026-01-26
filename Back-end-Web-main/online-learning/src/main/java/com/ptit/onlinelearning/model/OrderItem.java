package com.ptit.onlinelearning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;


@EqualsAndHashCode(onlyExplicitlyIncluded = true,callSuper = false)
@Entity
@Table(name = "order_items")
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_group_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private CourseGroup courseGroup;

}
