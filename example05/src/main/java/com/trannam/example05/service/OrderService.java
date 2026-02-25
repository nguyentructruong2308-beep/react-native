package com.trannam.example05.service;

import com.trannam.example05.payloads.OrderDTO;
import com.trannam.example05.payloads.OrderResponse;
import com.trannam.example05.payloads.OrderRequest;
import java.util.List;

public interface OrderService {
    // 🔥 Hỗ trợ thanh toán sản phẩm được chọn + Voucher + Scheduled
    OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod, Long addressId,
            OrderRequest orderRequest);

    OrderDTO getOrder(String emailId, Long orderId);

    List<OrderDTO> getOrdersByUser(String emailId);

    OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    OrderDTO updateOrder(String emailId, Long orderId, String orderStatus);

    // --- CÁC HÀM CHO ADMIN ---
    OrderDTO getOrderById(Long orderId);

    OrderDTO updateOrderStatus(Long orderId, String orderStatus);

    void cancelOrder(Long orderId);

    void finalizePayment(Long cartId);
}