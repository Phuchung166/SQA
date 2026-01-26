package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Lesson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class LessonResponse {

    private Long id;

    private Long moduleId;

    private String title;

    private String description;

    private String contentType;

    private String videoUrl;

    private String documentUrl;

    private String content;

    private Long duration;

    private Integer sortOrder;

    private Boolean isMandatory;

    private Boolean isPreview;

    private String createdAt;

    private Boolean isCompleted;

    private String updatedAt;

    public static LessonResponse fromEntity(Lesson lesson){
        if(lesson == null) return null;
        LessonResponse lessonResponse = new LessonResponse();
        lessonResponse.setId(lesson.getId());
        lessonResponse.setModuleId(lesson.getModuleId());
        lessonResponse.setTitle(lesson.getTitle());
        lessonResponse.setDescription(lesson.getDescription());
        lessonResponse.setContentType(lesson.getContentType());
        lessonResponse.setVideoUrl(lesson.getVideoUrl());
        lessonResponse.setDocumentUrl(lesson.getDocumentUrl());
        lessonResponse.setContent(lesson.getContent());
        lessonResponse.setDuration(lesson.getDuration());
        lessonResponse.setSortOrder(lesson.getSortOrder());
        lessonResponse.setIsMandatory(lesson.getIsMandatory());
        lessonResponse.setIsPreview(lesson.getIsPreview());
        lessonResponse.setCreatedAt(lesson.getCreatedAt().toString());
        lessonResponse.setUpdatedAt(lesson.getUpdatedAt().toString());
        lessonResponse.setIsCompleted(false); // default value
        return lessonResponse;
    }

    /**
     * Convert Lesson entity to LessonResponse for public access (without sensitive information)
     * Excludes: videoUrl, documentUrl, isCompleted
     */
    public static LessonResponse fromEntityForPublic(Lesson lesson){
        if(lesson == null) return null;
        LessonResponse lessonResponse = new LessonResponse();
        lessonResponse.setId(lesson.getId());
        lessonResponse.setModuleId(lesson.getModuleId());
        lessonResponse.setTitle(lesson.getTitle());
        lessonResponse.setDescription(lesson.getDescription());
        lessonResponse.setContentType(lesson.getContentType());
        // videoUrl, documentUrl, isCompleted are intentionally not set for public access
        lessonResponse.setContent(lesson.getContent());
        lessonResponse.setDuration(lesson.getDuration());
        lessonResponse.setSortOrder(lesson.getSortOrder());
        lessonResponse.setIsMandatory(lesson.getIsMandatory());
        lessonResponse.setIsPreview(lesson.getIsPreview());
        lessonResponse.setCreatedAt(lesson.getCreatedAt().toString());
        lessonResponse.setUpdatedAt(lesson.getUpdatedAt().toString());
        return lessonResponse;
    }
    public static LessonResponse fromEntityForAdmin(Lesson lesson){
        if(lesson == null) return null;
        LessonResponse lessonResponse = new LessonResponse();
        lessonResponse.setId(lesson.getId());
        lessonResponse.setModuleId(lesson.getModuleId());
        lessonResponse.setTitle(lesson.getTitle());
        lessonResponse.setDescription(lesson.getDescription());
        lessonResponse.setContentType(lesson.getContentType());
        lessonResponse.setContent(lesson.getContent());
        lessonResponse.setVideoUrl(lesson.getVideoUrl());
        lessonResponse.setDocumentUrl(lesson.getDocumentUrl());
        // videoUrl, documentUrl, isCompleted are intentionally not set for public access
        lessonResponse.setContent(lesson.getContent());
        lessonResponse.setDuration(lesson.getDuration());
        lessonResponse.setSortOrder(lesson.getSortOrder());
        lessonResponse.setIsMandatory(lesson.getIsMandatory());
        lessonResponse.setIsPreview(lesson.getIsPreview());
        lessonResponse.setCreatedAt(lesson.getCreatedAt().toString());
        lessonResponse.setUpdatedAt(lesson.getUpdatedAt().toString());
        return lessonResponse;
    }
}
