package com.ptit.onlinelearning.service.cartitem;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.*;
import com.ptit.onlinelearning.request.CartItemRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho CartItemService — Quản lý giỏ hàng khóa học.
 * Target: Line Coverage ≥ 80%, Branch Coverage ≥ 70%
 * Bao gồm cả CASE 1 (single course) và CASE 2 (course group).
 *
 * CheckDB: ArgumentCaptor xác minh CartItem lưu đúng dữ liệu.
 * Rollback: MockitoExtension reset hoàn toàn sau mỗi test.
 */
@ExtendWith(MockitoExtension.class)
class CartItemServiceTest {

    @Mock private CartItemRepository cartItemRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private CourseGroupRepository courseGroupRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private InstructorRepository instructorRepository;

    @InjectMocks
    private CartItemService cartItemService;

    // ===== FIXTURES =====
    private User buyerUser;
    private User instructorOwner;
    private Instructor ownerInstructor;
    private Course testCourse;
    private CartItem existingCartItem;

    @BeforeEach
    void setUp() {
        buyerUser = User.builder().id(1L).email("buyer@test.com").accountName("buyer01").build();
        buyerUser.setUserRoles(Set.of());

        instructorOwner = User.builder().id(2L).email("instr@test.com").accountName("instr01").build();
        instructorOwner.setUserRoles(Set.of());

        ownerInstructor = Instructor.builder().id(10L).userId(2L).slug("instr01-abc").build();

        testCourse = new Course();
        testCourse.setId(100L);
        testCourse.setTitle("Khóa học Spring Boot");
        testCourse.setInstructorId(10L);

        existingCartItem = new CartItem();
        existingCartItem.setId(1L);
        existingCartItem.setUser(buyerUser);
        existingCartItem.setCourse(testCourse);
    }

    // =====================================================
    // ===== CASE 1: SINGLE COURSE =====
    // =====================================================

    // =========================================================
    // TC-CART-001: Thêm single course vào giỏ hàng thành công
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CART-001: Thêm course vào giỏ hàng thành công — CheckDB xác minh CartItem lưu đúng")
    void TC_CART_001_createCartItem_singleCourse_success_cartItemSaved() {
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(100L);

        when(cartItemRepository.existsByUserIdAndCourseId(buyerUser.getId(), 100L)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseId(buyerUser.getId(), 100L)).thenReturn(false);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(testCourse));
        // buyer (id=1) != ownerInstructor.userId (id=2) → không phải own course
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(ownerInstructor));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(existingCartItem);

        CartItem result = cartItemService.createCartItem(buyerUser, request);

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getUser().getId()).isEqualTo(buyerUser.getId());
        assertThat(captor.getValue().getCourse().getId()).isEqualTo(100L);
        assertThat(result).isNotNull();
    }

    // =========================================================
    // TC-CART-002: Course đã có trong giỏ (single course)
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-002: Course đã có trong giỏ — ném InvalidParamException (already in cart)")
    void TC_CART_002_createCartItem_courseAlreadyInCart_throwsException() {
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(100L);
        when(cartItemRepository.existsByUserIdAndCourseId(buyerUser.getId(), 100L)).thenReturn(true);

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("already been added to cart");

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    // =========================================================
    // TC-CART-003: Course đã enrolled (single course)
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-003: Course đã enrolled — ném InvalidParamException (already enrolled)")
    void TC_CART_003_createCartItem_courseAlreadyEnrolled_throwsException() {
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(100L);
        when(cartItemRepository.existsByUserIdAndCourseId(buyerUser.getId(), 100L)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseId(buyerUser.getId(), 100L)).thenReturn(true);

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("already been enrolled");

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    // =========================================================
    // TC-CART-004: Course không tồn tại (single course)
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-004: Course không tồn tại — ném DataNotFoundException")
    void TC_CART_004_createCartItem_courseNotFound_throwsDataNotFoundException() {
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(999L);
        when(cartItemRepository.existsByUserIdAndCourseId(buyerUser.getId(), 999L)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseId(buyerUser.getId(), 999L)).thenReturn(false);
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found");

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    // =========================================================
    // TC-CART-005: Instructor thêm course của chính mình (single course)
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-005: Instructor thêm course của chính mình — ném InvalidParamException (own course)")
    void TC_CART_005_createCartItem_ownSingleCourse_throwsException() {
        CartItemRequest request = new CartItemRequest();
        request.setCourseId(100L);

        // instructorOwner (id=2) cố thêm course của mình (instructorId=10, userId=2)
        when(cartItemRepository.existsByUserIdAndCourseId(instructorOwner.getId(), 100L)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseId(instructorOwner.getId(), 100L)).thenReturn(false);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(testCourse));
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(ownerInstructor));

        assertThatThrownBy(() -> cartItemService.createCartItem(instructorOwner, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("cannot add your own course");

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    // =========================================================
    // TC-CART-006: Course có instructorId=null (single course) — bỏ qua check own course
    // Technique: EP (null branch trong instructorId)
    // =========================================================
    @Test
    @DisplayName("TC-CART-006: Course không có instructor — bỏ qua kiểm tra own-course, thêm thành công")
    void TC_CART_006_createCartItem_courseWithNullInstructorId_skipsOwnerCheck() {
        Course courseWithNoInstructor = new Course();
        courseWithNoInstructor.setId(200L);
        courseWithNoInstructor.setTitle("Open Course");
        courseWithNoInstructor.setInstructorId(null); // không có instructor

        CartItemRequest request = new CartItemRequest();
        request.setCourseId(200L);

        when(cartItemRepository.existsByUserIdAndCourseId(buyerUser.getId(), 200L)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseId(buyerUser.getId(), 200L)).thenReturn(false);
        when(courseRepository.findById(200L)).thenReturn(Optional.of(courseWithNoInstructor));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(new CartItem());

        CartItem result = cartItemService.createCartItem(buyerUser, request);

        verify(cartItemRepository, times(1)).save(any(CartItem.class));
        // instructorRepository.findById không được gọi vì instructorId=null
        verify(instructorRepository, never()).findById(any());
    }

    // =====================================================
    // ===== CASE 2: COURSE GROUP =====
    // =====================================================

    // =========================================================
    // TC-CART-007: Thêm course group vào giỏ hàng thành công
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CART-007: Thêm course group thành công — saveAll() được gọi, trả về CartItem đầu tiên")
    void TC_CART_007_createCartItem_courseGroup_success_allItemsSaved() {
        Long groupId = 5L;
        Course c1 = new Course(); c1.setId(101L); c1.setInstructorId(10L);
        Course c2 = new Course(); c2.setId(102L); c2.setInstructorId(10L);
        CourseGroup courseGroup = new CourseGroup();
        courseGroup.setId(groupId);
        courseGroup.setCourses(List.of(c1, c2));

        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(groupId);

        when(courseGroupRepository.findCourseGroupById(groupId)).thenReturn(Optional.of(courseGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);
        // instructor khác user mua (buyerUser.id=1, ownerInstructor.userId=2)
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(ownerInstructor));
        when(cartItemRepository.existsByUserIdAndCourseIdIn(eq(buyerUser.getId()), anyList())).thenReturn(false);

        CartItem savedItem = new CartItem(); savedItem.setId(10L);
        when(cartItemRepository.saveAll(anyList())).thenReturn(List.of(savedItem, new CartItem()));

        CartItem result = cartItemService.createCartItem(buyerUser, request);

        verify(cartItemRepository, times(1)).saveAll(anyList());
        assertThat(result.getId()).isEqualTo(10L);
    }

    // =========================================================
    // TC-CART-008: Course group không tồn tại
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-008: Course group không tồn tại — ném DataNotFoundException")
    void TC_CART_008_createCartItem_courseGroupNotFound_throwsDataNotFoundException() {
        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(999L);
        when(courseGroupRepository.findCourseGroupById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course group not found");

        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =========================================================
    // TC-CART-009: Course group đã có trong giỏ
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-009: Group đã có trong giỏ — ném InvalidParamException")
    void TC_CART_009_createCartItem_courseGroupAlreadyInCart_throwsException() {
        Long groupId = 5L;
        CourseGroup courseGroup = new CourseGroup(); courseGroup.setId(groupId);
        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(groupId);

        when(courseGroupRepository.findCourseGroupById(groupId)).thenReturn(Optional.of(courseGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(true);

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("course group has already been added to cart");

        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =========================================================
    // TC-CART-010: Course group đã enrolled
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-010: Group đã enrolled — ném InvalidParamException (already enrolled)")
    void TC_CART_010_createCartItem_courseGroupAlreadyEnrolled_throwsException() {
        Long groupId = 5L;
        CourseGroup courseGroup = new CourseGroup(); courseGroup.setId(groupId);
        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(groupId);

        when(courseGroupRepository.findCourseGroupById(groupId)).thenReturn(Optional.of(courseGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(true);

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("course group has already been enrolled");

        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =========================================================
    // TC-CART-011: Course group không có course nào
    // Technique: Negative Testing (null/empty branch)
    // =========================================================
    @Test
    @DisplayName("TC-CART-011: Group không có courses — ném InvalidParamException (no courses)")
    void TC_CART_011_createCartItem_emptyCourseGroup_throwsException() {
        Long groupId = 6L;
        CourseGroup emptyGroup = new CourseGroup();
        emptyGroup.setId(groupId);
        emptyGroup.setCourses(List.of()); // empty
        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(groupId);

        when(courseGroupRepository.findCourseGroupById(groupId)).thenReturn(Optional.of(emptyGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("no courses");

        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =========================================================
    // TC-CART-012: Instructor thêm course group của chính mình
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-012: Instructor thêm course group của mình — ném InvalidParamException (own group)")
    void TC_CART_012_createCartItem_ownCourseGroup_throwsException() {
        Long groupId = 5L;
        Course c1 = new Course(); c1.setId(101L); c1.setInstructorId(10L);
        CourseGroup ownGroup = new CourseGroup();
        ownGroup.setId(groupId);
        ownGroup.setCourses(List.of(c1));
        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(groupId);

        when(courseGroupRepository.findCourseGroupById(groupId)).thenReturn(Optional.of(ownGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(instructorOwner.getId(), groupId)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseGroupId(instructorOwner.getId(), groupId)).thenReturn(false);
        // instructorOwner.id=2, ownerInstructor.userId=2 → own course
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(ownerInstructor));

        assertThatThrownBy(() -> cartItemService.createCartItem(instructorOwner, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("cannot add your own course group");

        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =========================================================
    // TC-CART-013: Một trong các course của group đã có trong giỏ
    // Technique: Negative Testing (branch: existsByUserIdAndCourseIdIn)
    // =========================================================
    @Test
    @DisplayName("TC-CART-013: Một course trong group đã có trong giỏ — ném InvalidParamException")
    void TC_CART_013_createCartItem_courseInGroupAlreadyInCart_throwsException() {
        Long groupId = 5L;
        Course c1 = new Course(); c1.setId(101L); c1.setInstructorId(10L);
        CourseGroup courseGroup = new CourseGroup();
        courseGroup.setId(groupId);
        courseGroup.setCourses(List.of(c1));
        CartItemRequest request = new CartItemRequest();
        request.setCourseGroupId(groupId);

        when(courseGroupRepository.findCourseGroupById(groupId)).thenReturn(Optional.of(courseGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseGroupId(buyerUser.getId(), groupId)).thenReturn(false);
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(ownerInstructor));
        // Một course đã có trong giỏ
        when(cartItemRepository.existsByUserIdAndCourseIdIn(eq(buyerUser.getId()), anyList())).thenReturn(true);

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, request))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("already been added to cart");

        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =====================================================
    // ===== CASE 3: REQUEST TRỐNG =====
    // =====================================================

    // =========================================================
    // TC-CART-014: Request không có courseId và courseGroupId
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-014: Request trống (không courseId/groupId) — ném InvalidParamException")
    void TC_CART_014_createCartItem_emptyRequest_throwsInvalidParamException() {
        CartItemRequest emptyRequest = new CartItemRequest();

        assertThatThrownBy(() -> cartItemService.createCartItem(buyerUser, emptyRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Either courseId or courseGroupId");

        verify(cartItemRepository, never()).save(any(CartItem.class));
        verify(cartItemRepository, never()).saveAll(anyList());
    }

    // =====================================================
    // ===== GET CART ITEM BY ID =====
    // =====================================================

    // =========================================================
    // TC-CART-015: Lấy cart item theo ID — thành công
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-CART-015: Lấy cart item theo ID hợp lệ — trả về đúng CartItem")
    void TC_CART_015_getCartItemById_validId_returnsCartItem() {
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(existingCartItem));

        CartItem result = cartItemService.getCartItemById(1L, buyerUser);

        assertThat(result.getId()).isEqualTo(1L);
        verify(cartItemRepository, times(1)).findById(1L);
    }

    // =========================================================
    // TC-CART-016: Lấy cart item — không phải chủ sở hữu
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-016: Lấy cart item của người khác — ném AccessDeniedException")
    void TC_CART_016_getCartItemById_notOwner_throwsAccessDeniedException() {
        User anotherUser = User.builder().id(99L).email("other@test.com").build();
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(existingCartItem));

        assertThatThrownBy(() -> cartItemService.getCartItemById(1L, anotherUser))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================
    // TC-CART-017: Xóa cart item thành công
    // Technique: CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CART-017: Xóa cart item thành công — delete() được gọi đúng 1 lần")
    void TC_CART_017_deleteCartItem_ownCartItem_deletedSuccessfully() {
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(existingCartItem));
        doNothing().when(cartItemRepository).delete(any(CartItem.class));

        cartItemService.deleteCartItem(1L, buyerUser);

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository, times(1)).delete(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(1L);
    }

    // =========================================================
    // TC-CART-018: Xóa cart item — không phải chủ sở hữu
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-018: Xóa cart item của người khác — ném AccessDeniedException")
    void TC_CART_018_deleteCartItem_notOwner_throwsAccessDeniedException() {
        User anotherUser = User.builder().id(99L).email("other@test.com").build();
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(existingCartItem));

        assertThatThrownBy(() -> cartItemService.deleteCartItem(1L, anotherUser))
                .isInstanceOf(AccessDeniedException.class);

        verify(cartItemRepository, never()).delete(any(CartItem.class));
    }

    // =========================================================
    // TC-CART-019: Xóa tất cả cart items của user
    // Technique: CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CART-019: Xóa tất cả cart items — deleteAllByUserId được gọi với đúng userId")
    void TC_CART_019_deleteAllCartItemsByUserId_callsRepositoryCorrectly() {
        doNothing().when(cartItemRepository).deleteAllByUserId(buyerUser.getId());

        cartItemService.deleteAllCartItemsByUserId(buyerUser.getId());

        verify(cartItemRepository, times(1)).deleteAllByUserId(buyerUser.getId());
    }

    // =========================================================
    // TC-CART-020: Xóa cart item — ID không tồn tại
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CART-020: Xóa cart item không tồn tại — ném DataNotFoundException")
    void TC_CART_020_deleteCartItem_itemNotFound_throwsDataNotFoundException() {
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartItemService.deleteCartItem(999L, buyerUser))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("CartItem not found");

        verify(cartItemRepository, never()).delete(any(CartItem.class));
    }
}
