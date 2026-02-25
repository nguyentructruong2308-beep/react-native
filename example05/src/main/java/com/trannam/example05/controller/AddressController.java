package com.trannam.example05.controller;

import java.util.List;
import org.modelmapper.ModelMapper; // Cần thêm import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.trannam.example05.entity.Address;
import com.trannam.example05.payloads.AddressDTO;
import com.trannam.example05.service.AddressService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class AddressController {

    @Autowired private AddressService addressService;
    
    @Autowired private ModelMapper modelMapper; // Inject ModelMapper để fix lỗi map dữ liệu

    // --- CÁC API CHO ADMIN (Giữ nguyên) ---
    
    @PostMapping("/admin/address")
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO savedAddressDTO = addressService.createAddress(addressDTO);
        return new ResponseEntity<>(savedAddressDTO, HttpStatus.CREATED);
    }

    @GetMapping("/admin/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses() {
        List<AddressDTO> addressDTOs = addressService.getAddresses();
        return new ResponseEntity<>(addressDTOs, HttpStatus.OK);
    }

    // --- CÁC API CHO USER (Cập nhật đầy đủ) ---

    @GetMapping("/public/users/{email}/addresses")
    public ResponseEntity<List<AddressDTO>> getUserAddresses(@PathVariable String email) {
        List<AddressDTO> addresses = addressService.getAddressesByEmail(email); 
        return new ResponseEntity<>(addresses, HttpStatus.OK);
    }

    @PostMapping("/public/users/{email}/addresses")
    public ResponseEntity<AddressDTO> addAddressToUser(@PathVariable String email, @Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO savedAddress = addressService.createAddressForUser(email, addressDTO);
        return new ResponseEntity<>(savedAddress, HttpStatus.CREATED);
    }

    // 🔥 FIX LỖI 405: Thêm @PutMapping để hỗ trợ cập nhật địa chỉ
    @PutMapping("/public/users/{email}/addresses/{addressId}")
    public ResponseEntity<AddressDTO> updateUserAddress(
            @PathVariable String email, 
            @PathVariable Long addressId, 
            @Valid @RequestBody AddressDTO addressDTO) {
        
        // Chuyển DTO nhận được thành Entity Address
        Address addressDetails = modelMapper.map(addressDTO, Address.class);
        
        AddressDTO updatedAddress = addressService.updateAddress(addressId, addressDetails);
        return new ResponseEntity<>(updatedAddress, HttpStatus.OK);
    }

    @DeleteMapping("/public/users/{email}/addresses/{addressId}")
    public ResponseEntity<String> deleteUserAddress(@PathVariable String email, @PathVariable Long addressId) {
        String status = addressService.deleteAddress(addressId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}