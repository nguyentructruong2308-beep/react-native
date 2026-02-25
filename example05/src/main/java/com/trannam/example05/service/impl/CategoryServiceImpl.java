package com.trannam.example05.service.impl;

import java.io.IOException; // [MỚI] Thêm import này
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import com.trannam.example05.entity.*;
import com.trannam.example05.exceptions.*;
import com.trannam.example05.payloads.*;
import com.trannam.example05.repository.CategoryRepo;
import com.trannam.example05.service.*;
import jakarta.transaction.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

@Transactional
@Service
public class CategoryServiceImpl implements CategoryService {
    
    @Autowired private CategoryRepo categoryRepo;
    @Autowired private ProductService productService;
    @Autowired private ModelMapper modelMapper;
    @Autowired private FileService fileService; // [MỚI] Inject FileService

    @Value("${project.image}") // [MỚI] Lấy đường dẫn từ application.properties
    private String path;

    @Override
    // [CẬP NHẬT] Thay đổi tham số nhận vào là DTO và File
    public CategoryDTO createCategory(CategoryDTO categoryDTO, MultipartFile file) {
        // 1. Kiểm tra trùng tên danh mục
        Category savedCategory = categoryRepo.findByCategoryName(categoryDTO.getCategoryName());
        if (savedCategory != null) {
            throw new APIException("Category with the name " + categoryDTO.getCategoryName() + " already exists !!!");
        }

        // 2. Map từ DTO sang Entity
        Category category = modelMapper.map(categoryDTO, Category.class);

        // 3. Xử lý lưu file ảnh (nếu có)
        String fileName = "default.png"; // Ảnh mặc định nếu không upload
        try {
            if (file != null && !file.isEmpty()) {
                fileName = fileService.uploadImage(path, file);
            }
        } catch (IOException e) {
            throw new APIException("Could not upload image: " + e.getMessage());
        }
        category.setImage(fileName); // Lưu tên ảnh vào entity

        // 4. Lưu vào DB
        Category newCategory = categoryRepo.save(category);
        
        // 5. Trả về DTO
        return modelMapper.map(newCategory, CategoryDTO.class);
    }

    @Override
    public CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Category> pageCategories = categoryRepo.findAll(pageDetails);
        List<Category> categories = pageCategories.getContent();
        
        List<CategoryDTO> categoryDTOs = categories.stream()
            .map(category -> modelMapper.map(category, CategoryDTO.class)).collect(Collectors.toList());
        
        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setContent(categoryDTOs);
        categoryResponse.setPageNumber(pageCategories.getNumber());
        categoryResponse.setPageSize(pageCategories.getSize());
        categoryResponse.setTotalElements(pageCategories.getTotalElements());
        categoryResponse.setTotalPages(pageCategories.getTotalPages());
        categoryResponse.setLastPage(pageCategories.isLast());
        return categoryResponse;
    }

    @Override
    // [CẬP NHẬT] Thêm tham số MultipartFile để update ảnh
    public CategoryDTO updateCategory(CategoryDTO categoryDTO, Long categoryId, MultipartFile file) {
        // 1. Tìm Category cũ
        Category savedCategory = categoryRepo.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        
        // 2. Cập nhật thông tin cơ bản
        savedCategory.setCategoryName(categoryDTO.getCategoryName());

        // 3. Cập nhật ảnh mới (nếu người dùng gửi lên)
        try {
            if (file != null && !file.isEmpty()) {
                String fileName = fileService.uploadImage(path, file);
                savedCategory.setImage(fileName);
            }
        } catch (IOException e) {
            throw new APIException("Could not update image: " + e.getMessage());
        }

        // 4. Lưu thay đổi
        Category updatedCategory = categoryRepo.save(savedCategory);
        return modelMapper.map(updatedCategory, CategoryDTO.class);
    }

    @Override
    public String deleteCategory(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        List<Product> products = category.getProducts();
        products.forEach(product -> {
            productService.deleteProduct(product.getProductId());
        });
        categoryRepo.delete(category);
        return "Category with categoryId: " + categoryId + " deleted successfully !!!";
    }
    
    @Override
    public CategoryDTO getCategoryById(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        return modelMapper.map(category, CategoryDTO.class);
    }
}