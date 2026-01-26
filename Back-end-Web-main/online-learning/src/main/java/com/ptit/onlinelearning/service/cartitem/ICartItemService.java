package com.ptit.onlinelearning.service.cartitem;

import com.ptit.onlinelearning.request.CartItemRequest;
import com.ptit.onlinelearning.model.CartItem;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.order.CartItemResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;


public interface ICartItemService {
    Page<CartItem> getCartItems(int page, int pageSize, String sortBy, String sortOrder, Long userId, Long courseId);
    Page<CartItemResponse> getCartItemsByUserId(int page, int pageSize, String sortBy, String sortOrder, @NotNull Long userId);
    CartItem getCartItemById(Long id, User user);
    CartItem createCartItem(User user, CartItemRequest cartItemRequest);
    void deleteCartItem(Long id, User user);


    void deleteAllCartItemsByUserId(@NotNull Long userId);
}
