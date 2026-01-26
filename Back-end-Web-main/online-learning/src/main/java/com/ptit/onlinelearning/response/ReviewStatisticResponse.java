package com.ptit.onlinelearning.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.awt.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class ReviewStatisticResponse {
    private Long courseId;
    private Long totalReviews = 0L;
    private Double avgRating = 0.0;
    private Long totalRating1 = 0L;
    private Long totalRating2 = 0L;
    private Long totalRating3 = 0L;
    private Long totalRating4 = 0L;
    private Long totalRating5 = 0L;

    public static ReviewStatisticResponse fromEntity(Course course){
        if(course == null) return null;
        ReviewStatisticResponse reviewStatisticResponse = new ReviewStatisticResponse();
        reviewStatisticResponse.setCourseId(course.getId());
        if(course.getReviews() != null && !course.getReviews().isEmpty()){
            List<Review> reviews = course.getReviews();
            reviewStatisticResponse.setTotalReviews((long) reviews.size());
            reviewStatisticResponse.setAvgRating(reviews.stream().mapToDouble(Review::getRating).average().orElse(0.0));
            reviewStatisticResponse.setTotalRating1(reviews.stream().filter(review -> review.getRating() == 1).count());
            reviewStatisticResponse.setTotalRating2(reviews.stream().filter(review -> review.getRating() == 2).count());
            reviewStatisticResponse.setTotalRating3(reviews.stream().filter(review -> review.getRating() == 3).count());
            reviewStatisticResponse.setTotalRating4(reviews.stream().filter(review -> review.getRating() == 4).count());
            reviewStatisticResponse.setTotalRating5(reviews.stream().filter(review -> review.getRating() == 5).count());
        }
        return reviewStatisticResponse;
    }
}
