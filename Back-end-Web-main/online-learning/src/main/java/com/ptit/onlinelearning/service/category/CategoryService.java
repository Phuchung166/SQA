package com.ptit.onlinelearning.service.category;

import com.ptit.onlinelearning.request.CategoryRequest;
import com.ptit.onlinelearning.request.UpdateCategoryRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Category;
import com.ptit.onlinelearning.repository.CategoryRepository;
import com.ptit.onlinelearning.utility.SpecificationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService implements ICategoryService {
    
    private final CategoryRepository categoryRepository;

    @Override
    public Category createCategory(CategoryRequest categoryRequest) {
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setImage(categoryRequest.getImage());
        category.setDescription(categoryRequest.getDescription());
        category.setParentId(categoryRequest.getParentId());
        return categoryRepository.save(category);
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Category not found with "+id));
    }

    @Override
    public Page<Category> getCategories(int page, int pageSize, String sortBy, String sortOrder, String search, Boolean isActive, Long parentId) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        Specification<Category> spec = SpecificationUtils.filterCategory(search, isActive, parentId);
        return categoryRepository.findAll(spec, pageable);
    }

    @Override
    public Category updateCategory(Long id, UpdateCategoryRequest updateCategoryRequest) {
        Category existingCategory = getCategoryById(id);
        if(updateCategoryRequest.getName() != null) existingCategory.setName(updateCategoryRequest.getName());
        if(updateCategoryRequest.getDescription() != null) existingCategory.setDescription(updateCategoryRequest.getDescription());
        if(updateCategoryRequest.getImage() != null) existingCategory.setImage(updateCategoryRequest.getImage());
        if(updateCategoryRequest.getParentId() != null) existingCategory.setParentId(updateCategoryRequest.getParentId());
        return categoryRepository.save(existingCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
