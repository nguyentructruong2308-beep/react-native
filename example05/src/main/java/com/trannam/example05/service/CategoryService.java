package com.trannam.example05.service;

import org.springframework.web.multipart.MultipartFile;

import com.trannam.example05.entity.Category;
import com.trannam.example05.payloads.*;

public interface CategoryService {
    // Sửa lại hàm create và update
    CategoryDTO createCategory(CategoryDTO categoryDTO, MultipartFile file);

    CategoryDTO updateCategory(CategoryDTO categoryDTO, Long categoryId, MultipartFile file);

    CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    String deleteCategory(Long categoryId);

    // Thêm hàm này nếu cần dùng trong CategoryController
    CategoryDTO getCategoryById(Long categoryId);
}