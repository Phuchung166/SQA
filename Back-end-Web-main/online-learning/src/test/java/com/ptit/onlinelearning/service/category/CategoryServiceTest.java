package com.ptit.onlinelearning.service.category;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Category;
import com.ptit.onlinelearning.repository.CategoryRepository;
import com.ptit.onlinelearning.request.CategoryRequest;
import com.ptit.onlinelearning.request.UpdateCategoryRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho CategoryService.
 *
 * Chiến lược:
 *   - Dùng @ExtendWith(MockitoExtension.class) → mock state reset sau mỗi test (Rollback tự nhiên).
 *   - CheckDB: Dùng ArgumentCaptor để capture đối tượng được gửi vào repository,
 *              xác minh dữ liệu đúng trước khi "lưu" xuống DB layer.
 *   - Rollback: CategoryRepository là mock, không có thao tác nào ghi vào DB thật.
 */
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    // ===== Khai báo Mock Dependencies =====
    @Mock
    private CategoryRepository categoryRepository;

    // ===== Đối tượng cần test (System Under Test) =====
    @InjectMocks
    private CategoryService categoryService;

    // ===== Fixture dùng chung =====
    private Category existingCategory;

    @BeforeEach
    void setUp() {
        // Tạo Category mẫu dùng làm fixture cho nhiều test case
        existingCategory = new Category();
        existingCategory.setId(1L);
        existingCategory.setName("Lập trình Java");
        existingCategory.setDescription("Danh mục về Java");
        existingCategory.setImage("https://example.com/java.png");
        existingCategory.setIsActive(true);
    }

    // =========================================================
    // TC-CAT-001: Tạo category thành công
    // Objective: Khi gọi createCategory với request hợp lệ,
    //            service phải lưu entity đúng thông tin vào repository.
    // Technique: EP + CheckDB (ArgumentCaptor)
    // =========================================================
    @Test
    @DisplayName("TC-CAT-001: Tạo category thành công — CheckDB xác minh dữ liệu lưu đúng")
    void TC_CAT_001_createCategory_success_checkDB() {
        // === ARRANGE ===
        // Chuẩn bị request tạo mới
        CategoryRequest createCategoryRequest = new CategoryRequest();
        createCategoryRequest.setName("Lập trình Java");
        createCategoryRequest.setDescription("Danh mục về Java");
        createCategoryRequest.setImage("https://example.com/java.png");
        createCategoryRequest.setParentId(null);

        // Repository trả về category đã lưu (có ID = 1)
        when(categoryRepository.save(any(Category.class))).thenReturn(existingCategory);

        // === ACT ===
        Category actualResult = categoryService.createCategory(createCategoryRequest);

        // === ASSERT (CheckDB) ===
        // Capture đối tượng được gửi vào repository.save() để kiểm tra dữ liệu
        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository, times(1)).save(categoryCaptor.capture());

        Category capturedCategory = categoryCaptor.getValue();
        // Xác minh dữ liệu được ánh xạ đúng từ request sang entity
        assertThat(capturedCategory.getName()).isEqualTo("Lập trình Java");
        assertThat(capturedCategory.getDescription()).isEqualTo("Danh mục về Java");
        assertThat(capturedCategory.getImage()).isEqualTo("https://example.com/java.png");
        assertThat(capturedCategory.getParentId()).isNull();

        // Xác minh kết quả trả về đúng với category đã lưu
        assertThat(actualResult).isNotNull();
        assertThat(actualResult.getId()).isEqualTo(1L);
    }

    // =========================================================
    // TC-CAT-002: Lấy category theo ID hợp lệ
    // Objective: Khi ID tồn tại trong DB, service trả về đúng Category.
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-CAT-002: Lấy category theo ID hợp lệ — trả về đúng entity")
    void TC_CAT_002_getCategoryById_validId_returnsCategory() {
        // === ARRANGE ===
        Long validCategoryId = 1L;
        when(categoryRepository.findById(validCategoryId)).thenReturn(Optional.of(existingCategory));

        // === ACT ===
        Category actualResult = categoryService.getCategoryById(validCategoryId);

        // === ASSERT ===
        assertThat(actualResult).isNotNull();
        assertThat(actualResult.getId()).isEqualTo(validCategoryId);
        assertThat(actualResult.getName()).isEqualTo("Lập trình Java");
        verify(categoryRepository, times(1)).findById(validCategoryId);
    }

    // =========================================================
    // TC-CAT-003: Lấy category theo ID không tồn tại
    // Objective: Khi ID không có trong DB, service ném DataNotFoundException.
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CAT-003: Lấy category theo ID không tồn tại — ném DataNotFoundException")
    void TC_CAT_003_getCategoryById_invalidId_throwsDataNotFoundException() {
        // === ARRANGE ===
        Long nonExistentCategoryId = 999L;
        when(categoryRepository.findById(nonExistentCategoryId)).thenReturn(Optional.empty());

        // === ACT & ASSERT ===
        assertThatThrownBy(() -> categoryService.getCategoryById(nonExistentCategoryId))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining(String.valueOf(nonExistentCategoryId));

        verify(categoryRepository, times(1)).findById(nonExistentCategoryId);
    }

    // =========================================================
    // TC-CAT-004: Cập nhật category — chỉ đổi name
    // Objective: Khi chỉ cung cấp name trong UpdateRequest (các field khác null),
    //            service chỉ cập nhật name, giữ nguyên description và image.
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CAT-004: Cập nhật category partial (chỉ name) — CheckDB xác minh partial update")
    void TC_CAT_004_updateCategory_partialUpdate_onlyNameChanged() {
        // === ARRANGE ===
        Long categoryId = 1L;
        UpdateCategoryRequest updateRequest = new UpdateCategoryRequest();
        updateRequest.setName("Python");       // Chỉ đổi name
        updateRequest.setDescription(null);    // Giữ nguyên description
        updateRequest.setImage(null);           // Giữ nguyên image

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(existingCategory);

        // === ACT ===
        categoryService.updateCategory(categoryId, updateRequest);

        // === ASSERT (CheckDB) ===
        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository, times(1)).save(categoryCaptor.capture());

        Category capturedCategory = categoryCaptor.getValue();
        assertThat(capturedCategory.getName()).isEqualTo("Python");
        // Description và image phải giữ nguyên giá trị cũ (partial update)
        assertThat(capturedCategory.getDescription()).isEqualTo("Danh mục về Java");
        assertThat(capturedCategory.getImage()).isEqualTo("https://example.com/java.png");
    }

    // =========================================================
    // TC-CAT-005: Xóa category tồn tại
    // Objective: Khi ID tồn tại, service gọi repository.delete() đúng 1 lần
    //            với đúng entity đó.
    // Technique: CheckDB (verify delete được gọi đúng)
    // =========================================================
    @Test
    @DisplayName("TC-CAT-005: Xóa category tồn tại — CheckDB xác minh delete() được gọi đúng")
    void TC_CAT_005_deleteCategory_existingCategory_deleteCalled() {
        // === ARRANGE ===
        Long categoryId = 1L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(existingCategory));
        doNothing().when(categoryRepository).delete(any(Category.class));

        // === ACT ===
        categoryService.deleteCategory(categoryId);

        // === ASSERT (CheckDB) ===
        // Xác minh repository.delete() được gọi đúng 1 lần với đúng entity
        ArgumentCaptor<Category> deletedCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository, times(1)).delete(deletedCaptor.capture());
        assertThat(deletedCaptor.getValue().getId()).isEqualTo(1L);
    }

    // =========================================================
    // TC-CAT-006: Xóa category không tồn tại
    // Objective: Khi ID không có trong DB, service ném DataNotFoundException
    //            và không gọi delete().
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CAT-006: Xóa category không tồn tại — ném exception, delete() không được gọi")
    void TC_CAT_006_deleteCategory_nonExistentCategory_throwsAndDoesNotDelete() {
        // === ARRANGE ===
        Long nonExistentCategoryId = 999L;
        when(categoryRepository.findById(nonExistentCategoryId)).thenReturn(Optional.empty());

        // === ACT & ASSERT ===
        assertThatThrownBy(() -> categoryService.deleteCategory(nonExistentCategoryId))
                .isInstanceOf(DataNotFoundException.class);

        // Rollback verification: delete() không bao giờ được gọi
        verify(categoryRepository, never()).delete(any(Category.class));
    }
}
