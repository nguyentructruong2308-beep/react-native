package com.trannam.example05.controller;

import java.net.URI;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional; // [IMPORTANT] Import this
import org.springframework.web.bind.annotation.*;

import com.trannam.example05.entity.Order;
import com.trannam.example05.repository.OrderRepo;

@RestController
@RequestMapping("/api/public/payment")
public class MomoController {

    @Autowired
    private OrderRepo orderRepo;

    // 🔥 1. HANDLE IPN (MoMo calls this silently)
    @PostMapping("/momo-ipn")
    @Transactional // [IMPORTANT] Required for the custom delete method to work
    public ResponseEntity<?> ipnMomo(@RequestBody Map<String, Object> requestBody) {
        System.out.println(">> [IPN] Received signal from MoMo: " + requestBody);

        try {
            String resultCode = String.valueOf(requestBody.get("resultCode"));
            String orderIdStr = (String) requestBody.get("orderId");

            if ("0".equals(resultCode)) {
                // Extract real Order ID
                Long realOrderId = Long.parseLong(orderIdStr.split("_")[0]);

                // Find and update Order
                Order order = orderRepo.findById(realOrderId).orElse(null);

                if (order != null) {
                    // Update status if not already updated
                    if (!"Order Accepted".equals(order.getOrderStatus())) {
                        order.setOrderStatus("Order Accepted");
                        if (order.getPayment() != null) {
                            order.getPayment().setPaymentMethod("MOMO_WALLET");
                        }
                        orderRepo.save(order);
                        System.out.println(">> [IPN SUCCESS] Order #" + realOrderId + " status updated successfully!");

                        // 🔥 SẢN PHẨM ĐÃ ĐƯỢC XÓA Ở OrderServiceImpl.placeOrder()
                        // KHÔNG XÓA GIỎ HÀNG Ở ĐÂY NỮA ĐỂ GIỮ LẠI CÁC SP KHÔNG TICK
                        System.out.println(">> [IPN SUCCESS] Order #" + realOrderId + " status updated successfully!");
                    } else {
                        System.out.println(">> [IPN INFO] Order #" + realOrderId + " was already updated.");
                    }
                } else {
                    System.out.println(">> [IPN ERROR] Order #" + realOrderId + " not found.");
                }
            } else {
                System.out.println(">> [IPN FAIL] Transaction failed. ResultCode: " + resultCode);
            }

            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("IPN Processing Error");
        }
    }

    // 🔥 2. HANDLE REDIRECT (MoMo redirects user here)
    @GetMapping("/momo-return")
    public ResponseEntity<?> returnMomo(
            @RequestParam(required = false) String resultCode,
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String message) {

        System.out.println(">> [RETURN] User returned from MoMo. Code: " + resultCode);

        String redirectUrlClient;
        String realId = "0";
        if (orderId != null && orderId.contains("_")) {
            realId = orderId.split("_")[0];
        }

        // Redirect back to your Localhost Frontend
        redirectUrlClient = "http://localhost:8081/components/order/order-detail?resultCode=" + resultCode
                + "&orderData=%7B%22orderId%22:" + realId + "%7D";

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrlClient))
                .build();
    }
}