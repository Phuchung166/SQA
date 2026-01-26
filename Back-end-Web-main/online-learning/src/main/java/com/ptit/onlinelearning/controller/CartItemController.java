package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.CartItemRequest;
import com.ptit.onlinelearning.model.CartItem;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.order.CartItemResponse;
import com.ptit.onlinelearning.response.MessageResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.cartitem.ICartItemService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("${api.prefix}/cart_items")
@RequiredArgsConstructor
public class CartItemController {

    private final ICartItemService cartItemService;

    @GetMapping("/user")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Get user cart items", description = "Retrieves a paginated and sorted list of cart items that belong to the currently authenticated user.")
    public ResponseEntity<PageableResponse<CartItemResponse>> getUserCartItems(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @AuthenticationPrincipal User user
    ){
        int zeroBasedPage = Math.max(0, page - 1);
        Page<CartItemResponse> cartItemPage = cartItemService.getCartItemsByUserId(zeroBasedPage,  pageSize, sortBy, sortOrder, user.getId());
        PageableResponse<CartItemResponse> response = new PageableResponse<>();
        response.setCurrentPage(page);
        response.setTotalPages(cartItemPage.getTotalPages());
        response.setTotalElements(cartItemPage.getTotalElements());
        response.setPageSize(cartItemPage.getSize());
        response.setHasNext(cartItemPage.hasNext());
        response.setHasPrevious(cartItemPage.hasPrevious());
        response.setData(cartItemPage.getContent());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<CartItem> addCartItem(
            @Valid @RequestBody CartItemRequest cartItemRequest,
            @AuthenticationPrincipal User user
    ){
        CartItem cartItem = cartItemService.createCartItem(user, cartItemRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartItem);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<MessageResponse> deleteCartItem(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ){
        cartItemService.deleteCartItem(id, user);
        return ResponseEntity.ok(new MessageResponse("Cart item deleted successfully"));
    }

    @DeleteMapping("/user")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Delete all cart items by user ID", 
               description = "Deletes all cart items for a specific user")
    public ResponseEntity<MessageResponse> deleteAllCartItemsByUserId(
           @AuthenticationPrincipal User user
    ){
        cartItemService.deleteAllCartItemsByUserId(user.getId());
        return ResponseEntity.ok(new MessageResponse("All cart items deleted successfully for user ID: " + user.getId()));
    }

}
