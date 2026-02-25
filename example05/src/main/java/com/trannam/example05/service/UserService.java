package com.trannam.example05.service;

import com.trannam.example05.payloads.*;

public interface UserService {
    UserDTO registerUser(UserDTO userDTO);

    UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    UserDTO getUserById(Long userId);

    UserDTO updateUser(Long userId, UserDTO userDTO);

    String deleteUser(Long userId);

    // Trong file UserService.java
    UserDTO getUserByEmail(String email);

    void requestPasswordReset(String email);

    boolean verifyOtp(String email, String otp);

    void resetPassword(String email, String newPassword);

    void changePassword(Long userId, String oldPassword, String newPassword);

    UserDTO updateUserImage(Long userId, org.springframework.web.multipart.MultipartFile image)
            throws java.io.IOException;

    java.io.InputStream getUserImage(String fileName) throws java.io.FileNotFoundException;
}