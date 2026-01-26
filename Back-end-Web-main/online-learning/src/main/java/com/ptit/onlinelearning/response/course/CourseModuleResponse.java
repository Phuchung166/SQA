package com.ptit.onlinelearning.response.course;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Quiz;
import com.ptit.onlinelearning.response.LessonResponse;
import com.ptit.onlinelearning.response.quiz.QuizResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CourseModuleResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Boolean isPreview;
    private Integer sortOrder;
    private Integer totalLessons;
    private Long duration;
    private String createdAt;
    private String updatedAt;
    private List<LessonResponse> lessons;

    private List<QuizResponse> quizzes;

    public static CourseModuleResponse fromEntity(CourseModule courseModule){
        CourseModuleResponse moduleData = new CourseModuleResponse();
        moduleData.setId(courseModule.getId());
        moduleData.setCourseId(courseModule.getCourseId());
        moduleData.setTitle(courseModule.getTitle());
        moduleData.setDescription(courseModule.getDescription());
        moduleData.setSortOrder(courseModule.getSortOrder());
        moduleData.setIsPreview(courseModule.getIsPreview());
        moduleData.setTotalLessons(courseModule.getLessons() != null ? courseModule.getLessons().size() : 0);
        moduleData.setDuration(courseModule.getDuration());
        moduleData.setCreatedAt(courseModule.getCreatedAt().toString());
        moduleData.setUpdatedAt(courseModule.getUpdatedAt().toString());
        moduleData.setLessons(courseModule.getLessons() != null ?
                courseModule.getLessons().stream().map(LessonResponse::fromEntity).toList()
                : Collections.emptyList());
        moduleData.setQuizzes(courseModule.getQuizzes() != null ?
                courseModule.getQuizzes().stream().filter(Quiz::getIsActive).map(QuizResponse::fromEntity).toList()
                : Collections.emptyList());
        return moduleData;
    }

    /**
     * Convert CourseModule entity to CourseModuleResponse for public access
     * Lessons will exclude: videoUrl, documentUrl, isCompleted
     */
    public static CourseModuleResponse fromEntityForPublic(CourseModule courseModule){
        CourseModuleResponse moduleData = new CourseModuleResponse();
        moduleData.setId(courseModule.getId());
        moduleData.setCourseId(courseModule.getCourseId());
        moduleData.setTitle(courseModule.getTitle());
        moduleData.setDescription(courseModule.getDescription());
        moduleData.setSortOrder(courseModule.getSortOrder());
        moduleData.setIsPreview(courseModule.getIsPreview());
        moduleData.setTotalLessons(courseModule.getLessons() != null ? courseModule.getLessons().size() : 0);
        moduleData.setDuration(courseModule.getDuration());
        moduleData.setCreatedAt(courseModule.getCreatedAt().toString());
        moduleData.setUpdatedAt(courseModule.getUpdatedAt().toString());
        moduleData.setLessons(courseModule.getLessons() != null ?
                courseModule.getLessons().stream().map(LessonResponse::fromEntityForPublic).toList()
                : Collections.emptyList());
        return moduleData;
    }

    public static CourseModuleResponse fromEntityForAdmin(CourseModule courseModule){
        CourseModuleResponse moduleData = new CourseModuleResponse();
        moduleData.setId(courseModule.getId());
        moduleData.setCourseId(courseModule.getCourseId());
        moduleData.setTitle(courseModule.getTitle());
        moduleData.setDescription(courseModule.getDescription());
        moduleData.setSortOrder(courseModule.getSortOrder());
        moduleData.setIsPreview(courseModule.getIsPreview());
        moduleData.setTotalLessons(courseModule.getLessons() != null ? courseModule.getLessons().size() : 0);
        moduleData.setDuration(courseModule.getDuration());
        moduleData.setCreatedAt(courseModule.getCreatedAt().toString());
        moduleData.setUpdatedAt(courseModule.getUpdatedAt().toString());
        moduleData.setLessons(courseModule.getLessons() != null ?
                courseModule.getLessons().stream().map(LessonResponse::fromEntityForAdmin).toList()
                : Collections.emptyList());
        return moduleData;
    }
}
