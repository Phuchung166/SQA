package com.ptit.onlinelearning.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "answers")
@EqualsAndHashCode(callSuper = false)
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Answer  extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "answer_id_seq")
    @SequenceGenerator(name = "answer_id_seq", sequenceName = "answer_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "quiz_attempt_id", referencedColumnName = "id")
    private QuizAttempt quizAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "option_id", referencedColumnName = "id")
    private Option option;
}
