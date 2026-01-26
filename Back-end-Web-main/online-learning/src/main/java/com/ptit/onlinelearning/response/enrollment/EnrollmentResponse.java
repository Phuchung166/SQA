package com.ptit.onlinelearning.response.enrollment;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EnrollmentResponse {
    private Long id;
    private Double totalProgress;
    private LocalDateTime enrollmentDate;
    private LocalDateTime completedAt;
    private LocalDateTime lastAccessed;

    private String categoryName;
    private String instructorFirstName;
    private String instructorLastName;
    private String instructorAvatar;
}
