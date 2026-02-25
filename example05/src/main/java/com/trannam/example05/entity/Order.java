package com.trannam.example05.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Email
    @Column(nullable = false)
    private String email;

    @OneToMany(mappedBy = "order", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    private List<OrderItem> orderItems = new ArrayList<>();

    private LocalDate orderDate;

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    // 🔥 THÊM MỐI QUAN HỆ VỚI ĐỊA CHỈ ĐỂ FIX LỖI setAddress()
    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;

    private Double totalAmount;
    private Double discountAmount = 0.0;
    private Double shippingFee = 0.0;
    private Double finalAmount;
    private String orderStatus;

    // Đặt lịch giao hàng
    private String scheduledTime;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;
}