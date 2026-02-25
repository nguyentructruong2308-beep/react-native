package com.trannam.example05.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import java.util.Random;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.trannam.example05.config.AppConstants;
import com.trannam.example05.entity.*;
import com.trannam.example05.exceptions.*;
import com.trannam.example05.payloads.*;
import com.trannam.example05.repository.*;
import com.trannam.example05.service.UserService;
import com.trannam.example05.service.FileService;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private RoleRepo roleRepo;
    @Autowired
    private AddressRepo addressRepo;
    @Autowired
    private CartRepo cartRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private FileService fileService;

    @Value("${project.image}")
    private String path;

    // Đưa mailSender lên đầu cho đúng chuẩn
    @Autowired
    private JavaMailSender mailSender;

    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        try {
            // 1. Map dữ liệu cơ bản
            User user = modelMapper.map(userDTO, User.class);

            // 2. Mã hóa mật khẩu
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            // 3. Xử lý quyền hạn (Mặc định Role USER)
            Role role = roleRepo.findById(AppConstants.USER_ID)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "roleId", AppConstants.USER_ID));
            user.getRoles().add(role);

            // 4. Xử lý thông tin Địa chỉ
            AddressDTO aDTO = userDTO.getAddress();
            if (aDTO != null) {
                Address address = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                        aDTO.getCountry(), aDTO.getState(), aDTO.getCity(), aDTO.getPincode(), aDTO.getStreet(),
                        aDTO.getBuildingName());

                if (address == null) {
                    address = new Address(aDTO.getCountry(), aDTO.getState(), aDTO.getCity(), aDTO.getPincode(),
                            aDTO.getStreet(), aDTO.getBuildingName());
                    address = addressRepo.save(address);
                }
                List<Address> addressList = new ArrayList<>();
                addressList.add(address);
                user.setAddresses(addressList);
            } else {
                user.setAddresses(new ArrayList<>());
            }

            // 5. Lưu User mới
            User registeredUser = userRepo.save(user);

            // 6. TỰ ĐỘNG KHỞI TẠO GIỎ HÀNG
            Cart cart = new Cart();
            cart.setUser(registeredUser);
            cartRepo.save(cart);

            // 7. Ánh xạ trả về DTO
            UserDTO responseDTO = modelMapper.map(registeredUser, UserDTO.class);
            if (!registeredUser.getAddresses().isEmpty()) {
                responseDTO.setAddress(modelMapper.map(registeredUser.getAddresses().get(0), AddressDTO.class));
            }

            return responseDTO;

        } catch (DataIntegrityViolationException e) {
            throw new APIException("Lỗi dữ liệu Database: " + e.getMostSpecificCause().getMessage());
        } catch (Exception e) {
            throw new APIException("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @Override
    public UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<User> pageUsers = userRepo.findAll(pageDetails);
        List<User> users = pageUsers.getContent();

        List<UserDTO> userDTOs = users.stream().map(user -> {
            UserDTO dto = modelMapper.map(user, UserDTO.class);
            if (!user.getAddresses().isEmpty()) {
                dto.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
            }
            return dto;
        }).collect(Collectors.toList());

        UserResponse userResponse = new UserResponse();
        userResponse.setContent(userDTOs);
        userResponse.setPageNumber(pageUsers.getNumber());
        userResponse.setPageSize(pageUsers.getSize());
        userResponse.setTotalElements(pageUsers.getTotalElements());
        userResponse.setTotalPages(pageUsers.getTotalPages());
        userResponse.setLastPage(pageUsers.isLast());
        return userResponse;
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        // Thủ công nạp Địa chỉ
        if (!user.getAddresses().isEmpty()) {
            userDTO.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
        }

        // Thủ công nạp Giỏ hàng
        if (user.getCart() != null) {
            userDTO.setCart(modelMapper.map(user.getCart(), CartDTO.class));
        }

        return userDTO;
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setMobileNumber(userDTO.getMobileNumber());
        user.setEmail(userDTO.getEmail());

        if (userDTO.getAddress() != null) {
            AddressDTO aDTO = userDTO.getAddress();
            Address address = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                    aDTO.getCountry(), aDTO.getState(), aDTO.getCity(), aDTO.getPincode(), aDTO.getStreet(),
                    aDTO.getBuildingName());
            if (address == null) {
                address = new Address(aDTO.getCountry(), aDTO.getState(), aDTO.getCity(), aDTO.getPincode(),
                        aDTO.getStreet(), aDTO.getBuildingName());
                address = addressRepo.save(address);
            }
            List<Address> addresses = new ArrayList<>();
            addresses.add(address);
            user.setAddresses(addresses);
        }

        User updatedUser = userRepo.save(user);
        UserDTO responseDTO = modelMapper.map(updatedUser, UserDTO.class);

        if (!updatedUser.getAddresses().isEmpty()) {
            responseDTO.setAddress(modelMapper.map(updatedUser.getAddresses().get(0), AddressDTO.class));
        }
        return responseDTO;
    }

    @Override
    public String deleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        userRepo.delete(user);
        return "User with userId " + userId + " deleted successfully!!!";
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        // 1. Tìm user trong repo
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // 2. Chuyển đổi sang DTO cơ bản
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        // 3. Thủ công map Địa chỉ đầu tiên vào DTO
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            userDTO.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
        }

        // 4. Thủ công nạp Giỏ hàng
        if (user.getCart() != null) {
            userDTO.setCart(modelMapper.map(user.getCart(), CartDTO.class));
        }

        return userDTO;
    }

    // --- LOGIC QUÊN MẬT KHẨU (ĐÃ SỬA DÙNG userRepo) ---
    @Override
    public void requestPasswordReset(String email) {
        // 1. Tìm user trong DB (Dùng userRepo chuẩn)
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));

        // 2. Tạo mã OTP ngẫu nhiên (6 chữ số)
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        // 3. (QUAN TRỌNG) Lưu OTP vào DB
        user.setResetToken(otp);
        userRepo.save(user); // Đã sửa thành userRepo

        // Tạm thời in ra màn hình console để bạn test
        System.out.println("DEBUG: OTP gửi cho " + email + " là: " + otp);

        // 4. Gửi Email thật
        sendEmail(email, "Quên mật khẩu", "Mã xác nhận của bạn là: " + otp);
    }

    // Hàm phụ để gửi email
    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("your_email@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email đã được gửi thành công tới: " + to);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
            // Không throw exception để tránh crash app, chỉ log lỗi
        }
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        // Sử dụng Optional để xử lý an toàn
        return userRepo.findByEmail(email)
                .map(user -> {
                    // 1. In log ra TRƯỚC (để debug)
                    System.out.println("DEBUG: User Token trong DB: " + user.getResetToken());
                    System.out.println("DEBUG: OTP User nhập vào: " + otp);

                    // 2. Tính toán kết quả so sánh
                    boolean isMatch = user.getResetToken() != null && user.getResetToken().equals(otp);

                    System.out.println("DEBUG: Kết quả so sánh: " + isMatch);

                    // 3. Return kết quả ở dòng CUỐI CÙNG
                    return isMatch;
                })
                .orElseGet(() -> {
                    // Trường hợp không tìm thấy email
                    System.out.println("DEBUG: Không tìm thấy email: " + email);
                    return false;
                });
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Mã hóa mật khẩu mới và lưu lại
        user.setPassword(passwordEncoder.encode(newPassword));

        // Xóa token reset đi để không dùng lại được nữa
        user.setResetToken(null);

        userRepo.save(user);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        // 1. Tìm user theo ID
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        // 2. Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new APIException("Mật khẩu cũ không đúng");
        }

        // 3. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new APIException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        // 4. Cập nhật mật khẩu mới (mã hóa)
        user.setPassword(passwordEncoder.encode(newPassword));

        // 5. Lưu vào database
        userRepo.save(user);

        System.out.println("DEBUG: Đã đổi mật khẩu thành công cho userId: " + userId);
    }

    @Override
    public UserDTO updateUserImage(Long userId, org.springframework.web.multipart.MultipartFile image)
            throws java.io.IOException {
        User userFromDB = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        String fileName = fileService.uploadImage(path, image);
        userFromDB.setImage(fileName);

        User updatedUser = userRepo.save(userFromDB);

        UserDTO responseDTO = modelMapper.map(updatedUser, UserDTO.class);
        if (updatedUser.getAddresses() != null && !updatedUser.getAddresses().isEmpty()) {
            responseDTO.setAddress(modelMapper.map(updatedUser.getAddresses().get(0), AddressDTO.class));
        }
        return responseDTO;
    }

    @Override
    public java.io.InputStream getUserImage(String fileName) throws java.io.FileNotFoundException {
        return fileService.getResource(path, fileName);
    }

}