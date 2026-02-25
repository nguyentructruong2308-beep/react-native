package com.trannam.example05.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.trannam.example05.config.AppConstants;
import com.trannam.example05.payloads.*;
import com.trannam.example05.service.OrderService;
import com.trannam.example05.service.MomoService;
import com.trannam.example05.repository.AddressRepo;
import com.trannam.example05.repository.OrderRepo;
import com.trannam.example05.entity.Address;
import com.trannam.example05.entity.Order;
import com.trannam.example05.exceptions.ResourceNotFoundException;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private MomoService momoService;

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private OrderRepo orderRepo;

    // ============ USER (Hàm 3 tham số cũ - Giữ nguyên) ============

    @PostMapping("/public/users/{emailId}/carts/{cartId}/payments/{paymentMethod}/order")
    public ResponseEntity<?> orderProducts(
            @PathVariable String emailId,
            @PathVariable Long cartId,
            @PathVariable String paymentMethod) {

        List<Address> addresses = addressRepo.findByUserEmail(emailId);
        if (addresses == null || addresses.isEmpty()) {
            return ResponseEntity.badRequest().body("Người dùng chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!");
        }
        Address defaultAddress = addresses.get(0);
        Long addressId = defaultAddress.getAddressId();

        OrderDTO order = orderService.placeOrder(emailId, cartId, paymentMethod, addressId, null);

        if ("MOMO_WALLET".equals(paymentMethod)) {
            String dbOrderId = String.valueOf(order.getOrderId());
            String uniqueMomoOrderId = dbOrderId + "_" + System.currentTimeMillis();

            long shippingFee = 30000;
            try {
                if (defaultAddress.getCity() != null) {
                    String city = defaultAddress.getCity().toLowerCase();
                    if (city.contains("hồ chí minh") || city.contains("hà nội") || city.contains("hcm")) {
                        shippingFee = 15000;
                    }
                }
            } catch (Exception e) {
            }

            Double totalDouble = order.getTotalAmount();
            long productAmount = (totalDouble != null) ? totalDouble.longValue() : 0;
            long totalWithShip = productAmount + shippingFee;
            String amountStr = String.valueOf(totalWithShip);

            Order orderEntity = orderRepo.findById(order.getOrderId()).orElse(null);
            if (orderEntity != null) {
                orderEntity.setTotalAmount((double) totalWithShip);
                orderRepo.save(orderEntity);
            }

            Map<String, Object> momoRes = momoService.createPayment(uniqueMomoOrderId, amountStr,
                    "Thanh toan don hang #" + dbOrderId);
            if (momoRes != null && momoRes.containsKey("payUrl")) {
                Map<String, String> response = new HashMap<>();
                response.put("paymentUrl", momoRes.get("payUrl").toString());
                response.put("orderId", dbOrderId);
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/public/users/{email}/carts/{cartId}/payment-success")
    public ResponseEntity<String> confirmPaymentSuccess(@PathVariable String email, @PathVariable Long cartId) {
        if (cartId == -1)
            return ResponseEntity.ok("Thanh toán lại thành công!");
        orderService.finalizePayment(cartId);
        return ResponseEntity.ok("Đã xác nhận thanh toán và xóa giỏ hàng thành công!");
    }

    @PostMapping("/public/users/{email}/orders/{orderId}/repay/{paymentMethod}")
    public ResponseEntity<?> repayOrder(@PathVariable String email, @PathVariable Long orderId,
            @PathVariable String paymentMethod) {
        Order order = orderRepo.findById(orderId).orElse(null);
        if (order == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng");

        if ("MOMO_WALLET".equals(paymentMethod)) {
            String uniqueMomoOrderId = orderId + "_" + System.currentTimeMillis();
            String amountStr = String.valueOf(order.getTotalAmount().longValue());
            Map<String, Object> momoRes = momoService.createPayment(uniqueMomoOrderId, amountStr,
                    "Thanh toan lai don hang #" + orderId);
            if (momoRes != null && momoRes.containsKey("payUrl")) {
                Map<String, String> response = new HashMap<>();
                response.put("paymentUrl", momoRes.get("payUrl").toString());
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.badRequest().body("Phương thức thanh toán không hỗ trợ");
    }

    @PutMapping("/public/users/{email}/orders/{orderId}/payment-completed")
    public ResponseEntity<String> updatePaymentStatus(@PathVariable String email, @PathVariable Long orderId) {
        Order order = orderRepo.findById(orderId).orElse(null);
        if (order == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng");
        order.setOrderStatus("Order Accepted");
        orderRepo.save(order);
        return ResponseEntity.ok("Cập nhật trạng thái đơn hàng thành công!");
    }

    @GetMapping("/public/users/{emailId}/orders")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@PathVariable String emailId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(emailId));
    }

    @GetMapping("/public/users/{emailId}/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderByUser(@PathVariable String emailId, @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrder(emailId, orderId));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<OrderResponse> getAllOrders(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = AppConstants.SORT_ORDERS_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        return ResponseEntity.ok(orderService.getAllOrders(pageNumber, pageSize, sortBy, sortOrder));
    }

    @GetMapping("/admin/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderByIdForAdmin(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/admin/orders/{orderId}")
    public ResponseEntity<OrderDTO> updateOrderForAdmin(@PathVariable Long orderId, @RequestBody OrderDTO orderDTO) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, orderDTO.getOrderStatus()));
    }

    @PutMapping("/admin/users/{emailId}/orders/{orderId}/orderStatus/{orderStatus}")
    public ResponseEntity<OrderDTO> updateOrderByUser(@PathVariable String emailId, @PathVariable Long orderId,
            @PathVariable String orderStatus) {
        return ResponseEntity.ok(orderService.updateOrder(emailId, orderId, orderStatus));
    }

    @PutMapping("/public/users/{email}/orders/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable String email, @PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return new ResponseEntity<>("Đã hủy đơn thành công và hoàn trả kho", HttpStatus.OK);
    }

    // 🔥 FIX HÀM 4 THAM SỐ (HÀM APP ĐANG GỌI THẬT) 🔥
    @PostMapping("/public/users/{email}/carts/{cartId}/addresses/{addressId}/payments/{paymentMethod}/order")
    public ResponseEntity<?> placeOrder(
            @PathVariable String email,
            @PathVariable Long cartId,
            @PathVariable Long addressId,
            @PathVariable String paymentMethod,
            @RequestBody(required = false) OrderRequest orderRequest) {

        // 1. Tạo đơn hàng trong DB (đã bao gồm tính ship trong OrderServiceImpl)
        OrderDTO orderDTO = orderService.placeOrder(email, cartId, paymentMethod, addressId, orderRequest);

        // 🔥 FIX: Lấy số tiền đã tính sẵn (ĐÃ BAO GỒM SHIP & GIẢM GIÁ)
        double finalTotal = orderDTO.getFinalAmount();

        // 2. XỬ LÝ THANH TOÁN MOMO
        if ("MOMO_WALLET".equals(paymentMethod)) {
            String dbOrderId = String.valueOf(orderDTO.getOrderId());
            String uniqueMomoOrderId = dbOrderId + "_" + System.currentTimeMillis();
            String amountStr = String.valueOf((long) finalTotal);

            Map<String, Object> momoRes = momoService.createPayment(uniqueMomoOrderId, amountStr,
                    "Thanh toan don hang #" + dbOrderId);

            if (momoRes != null && momoRes.containsKey("payUrl")) {
                Map<String, Object> response = new HashMap<>();
                response.put("paymentUrl", momoRes.get("payUrl").toString());
                response.put("orderId", dbOrderId);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Lỗi tạo thanh toán MoMo");
            }
        }

        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }
}