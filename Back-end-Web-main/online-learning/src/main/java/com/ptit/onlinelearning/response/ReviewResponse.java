package com.ptit.onlinelearning.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Review;
import com.ptit.onlinelearning.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class ReviewResponse {

    private Long id;

    private Long courseId;

    private UserResponse user;

    private Integer rating;
    private String createdAt;

    private String comment;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class UserResponse {
        private String accountName;
        private String avatar;
    }

    public static ReviewResponse fromEntity(Review review) {
        if(review == null) return null;
        ReviewResponse reviewResponse = new ReviewResponse();
        reviewResponse.setId(review.getId());
        reviewResponse.setCourseId(review.getCourse().getId());
        reviewResponse.setRating(review.getRating());
        reviewResponse.setComment(review.getComment());
        reviewResponse.setCreatedAt(review.getCreatedAt().toString());
        User user = review.getUser();
        if(user != null){
            UserResponse userResponse = new UserResponse();
            userResponse.setAccountName(user.getAccountName());
            userResponse.setAvatar(user.getAvatar());
            reviewResponse.setUser(userResponse);
        }
        return reviewResponse;
    }
}
