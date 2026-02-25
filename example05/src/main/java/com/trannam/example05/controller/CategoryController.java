package com.trannam.example05.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; 

import com.trannam.example05.config.AppConstants;
import com.trannam.example05.payloads.CategoryDTO;
import com.trannam.example05.payloads.CategoryResponse;
import com.trannam.example05.service.CategoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*") 
public class CategoryController {
    
    @Autowired private CategoryService categoryService;

    // [API 1] Tạo danh mục mới (Có hỗ trợ upload ảnh)
    @PostMapping(value = "/admin/categories", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CategoryDTO> createCategory(
            @Valid @RequestPart("category") CategoryDTO categoryDTO, 
            @RequestPart("image") MultipartFile image) {
        
        CategoryDTO savedCategoryDTO = categoryService.createCategory(categoryDTO, image);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.CREATED);
    }

    // [API 2] Lấy danh sách danh mục (Public - Dùng cho trang List)
    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getCategories(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_CATEGORIES_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        
        CategoryResponse categoryResponse = categoryService.getCategories(
            pageNumber == 0 ? pageNumber : pageNumber - 1, 
            pageSize, 
            "id".equals(sortBy) ? "categoryId" : sortBy, 
            sortOrder
        );
        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }
    
    // [API 3] Lấy chi tiết 1 danh mục (Public - Dùng cho khách xem)
    @GetMapping("/public/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> getOneCategory(@PathVariable Long categoryId) {
        CategoryDTO categoryDTO = categoryService.getCategoryById(categoryId);
        return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
    }

    // [API 4 - QUAN TRỌNG] Lấy chi tiết cho Admin (FIX LỖI 401 KHI EDIT TRÊN REACT ADMIN)
    // React Admin sẽ gọi API này để điền dữ liệu cũ vào form sửa
    @GetMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> getOneCategoryForAdmin(@PathVariable Long categoryId) {
        CategoryDTO categoryDTO = categoryService.getCategoryById(categoryId);
        return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
    }

    // [API 5] Cập nhật danh mục (Có hỗ trợ thay đổi ảnh)
    @PutMapping(value = "/admin/categories/{categoryId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CategoryDTO> updateCategory(
            @Valid @RequestPart("category") CategoryDTO categoryDTO,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @PathVariable Long categoryId) {
        
        CategoryDTO updatedCategory = categoryService.updateCategory(categoryDTO, categoryId, image);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }

    // [API 6] Xóa danh mục
    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {
        String status = categoryService.deleteCategory(categoryId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}