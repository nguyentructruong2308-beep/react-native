package com.trannam.example05.entity;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voucherId;

    @Column(unique = true, nullable = false)
    private String code;

    private Double discountAmount;

    private String discountType; // PERCENTAGE or FIXED

    private Double minOrderAmount;

    private LocalDate expiryDate;

    private Boolean active = true;
}
