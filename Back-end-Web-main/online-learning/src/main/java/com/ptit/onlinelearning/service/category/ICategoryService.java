package com.ptit.onlinelearning.service.category;

import com.ptit.onlinelearning.request.CategoryRequest;
import com.ptit.onlinelearning.request.UpdateCategoryRequest;
import com.ptit.onlinelearning.model.Category;
import org.springframework.data.domain.Page;


public interface ICategoryService {
    Category createCategory(CategoryRequest categoryRequest);
    Category getCategoryById(Long id);
    Page<Category> getCategories(int page, int pageSize, String sortBy, String sortOrder, String search, Boolean isActive, Long parentId);
    Category updateCategory(Long id, UpdateCategoryRequest updateCategoryRequest);
    void deleteCategory(Long id);
}
