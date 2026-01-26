package com.ptit.onlinelearning.response.course;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.model.CourseGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CourseGroupDetailResponse {

    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private BigDecimal customPrice;

    private String whatYouLearn;

    private Currency currency;

    private String thumbnail;

    private EnrollmentType enrollmentType;

    private List<CourseResponse> listOfCourses;


    public static CourseGroupDetailResponse fromEntity(CourseGroup courseGroup){
        if(courseGroup == null) return null;
        CourseGroupDetailResponse courseGroupDetailResponse = new CourseGroupDetailResponse();
        courseGroupDetailResponse.setId(courseGroup.getId());
        courseGroupDetailResponse.setTitle(courseGroup.getTitle());
        courseGroupDetailResponse.setDescription(courseGroup.getDescription());
        courseGroupDetailResponse.setPrice(courseGroup.getPrice());
        courseGroupDetailResponse.setCustomPrice(courseGroup.getCustomPrice());
        courseGroupDetailResponse.setWhatYouLearn(courseGroup.getWhatYouLearn());
        courseGroupDetailResponse.setCurrency(courseGroup.getCurrency());
        courseGroupDetailResponse.setThumbnail(courseGroup.getThumbnail());
        courseGroupDetailResponse.setEnrollmentType(courseGroup.getEnrollmentType());
        courseGroupDetailResponse.setListOfCourses(courseGroup.getCourses() != null ?
                courseGroup.getCourses().stream().map(CourseResponse::fromEntity).toList()
                : Collections.emptyList()
                );

        return courseGroupDetailResponse;
    }
}


