package com.trannam.example05.controller;

import com.trannam.example05.entity.Voucher;
import com.trannam.example05.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    // --- PUBLIC ENDPOINTS (Mobile App) ---
    @GetMapping("/public/vouchers/check/{code}")
    public ResponseEntity<?> checkVoucher(@PathVariable String code, @RequestParam Double amount) {
        return voucherService.validateVoucher(code, amount)
                .map(v -> ResponseEntity.ok((Object) v))
                .orElse(ResponseEntity.badRequest().body("Voucher không hợp lệ hoặc đã hết hạn!"));
    }

    // --- ADMIN ENDPOINTS (React Admin Dashboard) ---
    @GetMapping("/admin/vouchers")
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @GetMapping("/admin/vouchers/{id}")
    public ResponseEntity<Voucher> getVoucherById(@PathVariable Long id) {
        return voucherService.getVoucherById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin/vouchers")
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherService.saveVoucher(voucher));
    }

    @PutMapping("/admin/vouchers/{id}")
    public ResponseEntity<Voucher> updateVoucher(@PathVariable Long id, @RequestBody Voucher voucher) {
        voucher.setVoucherId(id);
        return ResponseEntity.ok(voucherService.saveVoucher(voucher));
    }

    @DeleteMapping("/admin/vouchers/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok().build();
    }
}
