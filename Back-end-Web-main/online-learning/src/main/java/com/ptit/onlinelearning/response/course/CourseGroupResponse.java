package com.ptit.onlinelearning.response.course;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CourseGroupResponse {

    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private BigDecimal customPrice;

    private String whatYouLearn;

    private int totalCourses;

    private Currency currency;

    private String thumbnail;
    private String createdAt;
    private String updatedAt;

    private EnrollmentType enrollmentType;

    private CategoryResponse category;

    private InstructorResponse instructor;

    private Boolean isPreOrder;

    private LocalDateTime bundlePreorderStartDate;

    private LocalDateTime bundlePreorderEndDate;

    private BigDecimal preOrderPrice;

    private Integer bundleTotalSlots;

    private Integer bundleRemainingSlots;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class InstructorResponse{

        private String firstName;
        private String lastName;
        private String slug;
        private String avatar;

    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class CategoryResponse {

        private Long id;

        private String name;
    }

    public static CourseGroupResponse fromEntity(CourseGroup courseGroup){
        if(courseGroup == null) return null;
        CourseGroupResponse courseGroupResponse = new CourseGroupResponse();
        courseGroupResponse.setId(courseGroup.getId());
        courseGroupResponse.setTitle(courseGroup.getTitle());
        courseGroupResponse.setDescription(courseGroup.getDescription());
        courseGroupResponse.setPrice(courseGroup.getPrice());
        courseGroupResponse.setCustomPrice(courseGroup.getCustomPrice());
        courseGroupResponse.setWhatYouLearn(courseGroup.getWhatYouLearn());
        courseGroupResponse.setCurrency(courseGroup.getCurrency());
        courseGroupResponse.setThumbnail(courseGroup.getThumbnail());
        courseGroupResponse.setEnrollmentType(courseGroup.getEnrollmentType());
        courseGroupResponse.setTotalCourses(courseGroup.getCourses().size());
        
        // Pre-order information
        courseGroupResponse.setIsPreOrder(courseGroup.getIsPreOrder());
        courseGroupResponse.setBundlePreorderStartDate(courseGroup.getBundlePreorderStartDate());
        courseGroupResponse.setBundlePreorderEndDate(courseGroup.getBundlePreorderEndDate());
        courseGroupResponse.setPreOrderPrice(courseGroup.getPreOrderPrice());
        courseGroupResponse.setBundleTotalSlots(courseGroup.getBundleTotalSlots());
        courseGroupResponse.setBundleRemainingSlots(courseGroup.getBundleRemainingSlots());
        
        if(courseGroup.getCourses() != null && courseGroup.getCourses().getFirst() != null){
            Course course = courseGroup.getCourses().getFirst();
            if(course.getCategory() != null){
                CategoryResponse categoryResponse = new CategoryResponse();
                categoryResponse.setId(course.getCategory().getId());
                categoryResponse.setName(course.getCategory().getName());
                courseGroupResponse.setCategory(categoryResponse);
            }
            if(course.getInstructor() != null && course.getInstructor().getUser() != null){
                User user = course.getInstructor().getUser();
                Instructor instructor = course.getInstructor();
                InstructorResponse instructorResponse = new InstructorResponse();
                instructorResponse.setFirstName(user.getFirstName());
                instructorResponse.setLastName(user.getLastName());
                instructorResponse.setAvatar(user.getAvatar());
                instructorResponse.setSlug(instructor.getSlug());
                courseGroupResponse.setInstructor(instructorResponse);
            }
        }
        return courseGroupResponse;
    }
}
