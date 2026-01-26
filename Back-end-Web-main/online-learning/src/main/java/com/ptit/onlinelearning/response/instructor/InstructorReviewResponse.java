package com.ptit.onlinelearning.response.instructor;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Review;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorReviewResponse {
    private Long instructorId;
    private Long totalReviews = 0L;
    private Double avgRating = 0.0;
    private Long totalRating1 = 0L;
    private Long totalRating2 = 0L;
    private Long totalRating3 = 0L;
    private Long totalRating4 = 0L;
    private Long totalRating5 = 0L;

    public static InstructorReviewResponse fromEntity(Instructor instructor) {
        if (instructor == null) {
            return null;
        }

        List<Course> courses = instructor.getCourses();
        if (courses == null || courses.isEmpty()) {
            return new InstructorReviewResponse(
                    instructor.getId(),
                    0L, 0.0,
                    0L, 0L, 0L, 0L, 0L
            );
        }

        List<Review> allReviews = courses.stream()
                .filter(Objects::nonNull)
                .flatMap(course -> {
                    List<Review> reviews = course.getReviews();
                    return reviews != null ? reviews.stream() : Stream.empty();
                })
                .filter(Objects::nonNull)
                .toList();

        long totalReviews = allReviews.size();

        if (totalReviews == 0) {
            return new InstructorReviewResponse(
                    instructor.getId(),
                    0L, 0.0,
                    0L, 0L, 0L, 0L, 0L
            );
        }

        long totalRating1 = allReviews.stream().filter(r -> r.getRating() != null && r.getRating() == 1).count();
        long totalRating2 = allReviews.stream().filter(r -> r.getRating() != null && r.getRating() == 2).count();
        long totalRating3 = allReviews.stream().filter(r -> r.getRating() != null && r.getRating() == 3).count();
        long totalRating4 = allReviews.stream().filter(r -> r.getRating() != null && r.getRating() == 4).count();
        long totalRating5 = allReviews.stream().filter(r -> r.getRating() != null && r.getRating() == 5).count();

        double avgRating = allReviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);

        return new InstructorReviewResponse(
                instructor.getId(),
                totalReviews,
                avgRating,
                totalRating1,
                totalRating2,
                totalRating3,
                totalRating4,
                totalRating5
        );
    }
}
