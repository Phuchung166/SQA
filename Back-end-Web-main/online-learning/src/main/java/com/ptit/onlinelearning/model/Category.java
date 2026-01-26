package com.ptit.onlinelearning.model;

import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.utility.GenerateSlug;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@EntityListeners(Category.CategoryListener.class)
@Table(name = "categories")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Category extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "category_id_gen")
    @SequenceGenerator(name = "category_id_gen", sequenceName = "category_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "image",  columnDefinition = "TEXT")
    private String image;

    @Column(name = "parent_id")
    private Long parentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Category parent;

    @Column(name = "slug", length = 200)
    private String slug;


    @Column(name = "description", length = 200)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Bidirectional relationship: One Category has many Courses
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Course> courses;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Category> children;

    public static class CategoryListener {
        @PrePersist
        @PreUpdate
        public void generateSlug(Category category) {
            if (category.getName() != null &&
                    (category.getSlug() == null || category.getSlug().isEmpty())) {
                category.setSlug(GenerateSlug.toSlug(category.getName())+"-"+ System.currentTimeMillis());
            }
        }
    }
}
