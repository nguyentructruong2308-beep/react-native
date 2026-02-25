package com.trannam.example05.service;

import com.trannam.example05.entity.Voucher;
import com.trannam.example05.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    public Optional<Voucher> validateVoucher(String code, Double orderAmount) {
        Optional<Voucher> opt = voucherRepository.findByCode(code);
        if (opt.isPresent()) {
            Voucher v = opt.get();
            if (v.getActive() && (v.getExpiryDate() == null || v.getExpiryDate().isAfter(LocalDate.now()))) {
                if (v.getMinOrderAmount() == null || orderAmount >= v.getMinOrderAmount()) {
                    return Optional.of(v);
                }
            }
        }
        return Optional.empty();
    }

    public java.util.List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    public Optional<Voucher> getVoucherById(Long id) {
        return voucherRepository.findById(id);
    }

    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }

    public Voucher saveVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }
}
