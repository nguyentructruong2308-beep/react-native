package com.trannam.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trannam.example05.entity.Address;
import com.trannam.example05.entity.User;
import com.trannam.example05.exceptions.APIException;
import com.trannam.example05.exceptions.ResourceNotFoundException;
import com.trannam.example05.payloads.AddressDTO;
import com.trannam.example05.repository.AddressRepo;
import com.trannam.example05.repository.UserRepo;
import com.trannam.example05.service.AddressService;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public AddressDTO createAddress(AddressDTO addressDTO) {
        // Kiểm tra xem địa chỉ đã tồn tại trong DB chưa dựa trên các thông tin chi tiết
        Address addressFromDB = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                addressDTO.getCountry(), addressDTO.getState(), addressDTO.getCity(), 
                addressDTO.getPincode(), addressDTO.getStreet(), addressDTO.getBuildingName());

        if (addressFromDB != null) {
            throw new APIException("Address already exists with addressId: " + addressFromDB.getAddressId());
        }

        // Map từ DTO sang Entity và lưu vào database
        Address address = modelMapper.map(addressDTO, Address.class);
        Address savedAddress = addressRepo.save(address);

        return modelMapper.map(savedAddress, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getAddresses() {
        // Lấy tất cả danh sách địa chỉ và chuyển sang DTO
        List<Address> addresses = addressRepo.findAll();
        
        return addresses.stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public AddressDTO getAddress(Long addressId) {
        // Tìm địa chỉ theo ID, nếu không thấy tung ngoại lệ ResourceNotFoundException
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));
        
        return modelMapper.map(address, AddressDTO.class);
    }

    @Override
    public AddressDTO updateAddress(Long addressId, Address address) {
        // Tìm địa chỉ cũ trong database
        Address addressFromDB = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        // Cập nhật các trường thông tin mới
        addressFromDB.setCountry(address.getCountry());
        addressFromDB.setState(address.getState());
        addressFromDB.setCity(address.getCity());
        addressFromDB.setPincode(address.getPincode());
        addressFromDB.setStreet(address.getStreet());
        addressFromDB.setBuildingName(address.getBuildingName());

        // Lưu bản ghi đã cập nhật
        Address updatedAddress = addressRepo.save(addressFromDB);

        return modelMapper.map(updatedAddress, AddressDTO.class);
    }

    @Override
    public String deleteAddress(Long addressId) {
        // Tìm địa chỉ trước khi xóa
        Address addressFromDB = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        // Xử lý quan hệ Many-to-Many: Xóa liên kết của địa chỉ này với tất cả người dùng
        List<User> users = userRepo.findByAddress(addressId);
        users.forEach(user -> {
            user.getAddresses().remove(addressFromDB);
            userRepo.save(user);
        });

        // Xóa hẳn bản ghi địa chỉ
        addressRepo.deleteById(addressId);

        return "Address deleted successfully with addressId: " + addressId;
    }

    @Override
    public AddressDTO createAddressForUser(String email, AddressDTO addressDTO) {
        // Tìm người dùng theo email
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Chuyển DTO thành Entity
        Address address = modelMapper.map(addressDTO, Address.class);

        // Thiết lập mối quan hệ Many-to-Many hai chiều
        address.getUsers().add(user);
        user.getAddresses().add(address);

        // Lưu địa chỉ (Cascade hoặc lưu thủ công tùy cấu trúc JPA của bạn, thường là save address)
        Address savedAddress = addressRepo.save(address);

        return modelMapper.map(savedAddress, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getAddressesByEmail(String email) {
        // Lấy danh sách địa chỉ của một người dùng cụ thể dựa trên email
        List<Address> addresses = addressRepo.findByUserEmail(email);

        return addresses.stream()
                .map(a -> modelMapper.map(a, AddressDTO.class))
                .collect(Collectors.toList());
    }
}