package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.CategoryRequest;
import com.ptit.onlinelearning.request.UpdateCategoryRequest;
import com.ptit.onlinelearning.model.Category;
import com.ptit.onlinelearning.response.CategoryResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.category.ICategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final ICategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new category", description = "Creates a new category. Admin role required.")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        Category createdCategory = categoryService.createCategory(categoryRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(CategoryResponse.fromEntity(createdCategory));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(CategoryResponse.fromEntity(category));
    }

    @GetMapping
    public ResponseEntity<PageableResponse<CategoryResponse>> getCategories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Long parentId
    ) {
        Page<Category> categoryPage = categoryService.getCategories(page, pageSize, sortBy, sortOrder, search, isActive, parentId);
        List<CategoryResponse> data = categoryPage.getContent()
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(
                new PageableResponse<>(
                        categoryPage.getNumber() + 1,
                        categoryPage.getTotalPages(),
                        categoryPage.getTotalElements(),
                        categoryPage.getSize(),
                        categoryPage.hasNext(),
                        categoryPage.hasPrevious(),
                        data
                )
        );
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a category by ID", description = "Updates category details. Admin role required.")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateCategoryRequest updateCategoryRequest) {
        Category updatedCategory = categoryService.updateCategory(id, updateCategoryRequest);
        return ResponseEntity.ok(CategoryResponse.fromEntity(updatedCategory));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a category by ID", description = "Deletes a category. Admin role required.")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
