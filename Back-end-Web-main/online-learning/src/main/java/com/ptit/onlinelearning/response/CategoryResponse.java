package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CategoryResponse {

    private Long id;

    private String name;

    private String image;

    private String slug;

    private Long parentId;

    private String description;

    private String createdAt;

    private String updatedAt;

    public static CategoryResponse fromEntity(Category category) {
        if(category == null) return null;
        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setId(category.getId());
        categoryResponse.setName(category.getName());
        categoryResponse.setImage(category.getImage());
        categoryResponse.setSlug(category.getSlug());
        categoryResponse.setParentId(categoryResponse.getParentId());
        categoryResponse.setDescription(category.getDescription());
        categoryResponse.setCreatedAt(category.getCreatedAt().toString());
        categoryResponse.setUpdatedAt(category.getUpdatedAt().toString());
        return categoryResponse;
    }

}
