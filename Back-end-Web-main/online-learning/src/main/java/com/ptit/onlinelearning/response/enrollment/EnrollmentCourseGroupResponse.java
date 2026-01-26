package com.ptit.onlinelearning.response.enrollment;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EnrollmentCourseGroupResponse {
    private Long courseGroupId;
    private String courseGroupDescription;
    private String courseGroupThumbnail;
    private String courseGroupTitle;
    private String whatYouLearn;
    private EnrollmentType enrollmentType;
    private List<EnrollmentCourseResponse> enrollmentCourseResponses;
}
