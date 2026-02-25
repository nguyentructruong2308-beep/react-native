package com.trannam.example05.payloads;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private List<Long> selectedProductIds;
    private String voucherCode;
    private String scheduledTime;
}
