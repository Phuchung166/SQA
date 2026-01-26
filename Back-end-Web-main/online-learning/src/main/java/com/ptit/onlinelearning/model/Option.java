package com.ptit.onlinelearning.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "options")
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Option extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "option_id_seq")
    @SequenceGenerator(name = "option_id_seq", sequenceName = "option_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "sort_order", nullable = false)
    private Long sortOrder;

    @Column(name = "is_correct", nullable = false)
    @JsonIgnore
    private Boolean isCorrect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private Question question;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "option", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<Answer> answers;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Option other)) return false;

        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

}
