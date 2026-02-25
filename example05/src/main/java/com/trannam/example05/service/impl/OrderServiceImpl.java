package com.trannam.example05.service.impl;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import com.trannam.example05.entity.*;
import com.trannam.example05.exceptions.*;
import com.trannam.example05.payloads.*;
import com.trannam.example05.repository.*;
import com.trannam.example05.service.*;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    public UserRepo userRepo;
    @Autowired
    public CartRepo cartRepo;
    @Autowired
    public OrderRepo orderRepo;
    @Autowired
    private PaymentRepo paymentRepo;
    @Autowired
    public OrderItemRepo orderItemRepo;
    @Autowired
    public CartItemRepo cartItemRepo;
    @Autowired
    public UserService userService;
    @Autowired
    public CartService cartService;
    @Autowired
    public ModelMapper modelMapper;
    @Autowired
    public AddressRepo addressRepo;
    @Autowired
    private VoucherService voucherService;
    @Autowired
    private ProductRepo productRepo;

    @Override
    @Transactional
    public OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod, Long addressId,
            OrderRequest orderRequest) {

        List<Long> selectedProductIds = orderRequest != null ? orderRequest.getSelectedProductIds() : null;

        // 1. Tìm giỏ hàng của người dùng
        Cart cart = cartRepo.findCartByEmailAndCartId(emailId, cartId);
        if (cart == null)
            throw new ResourceNotFoundException("Cart", "cartId", cartId);

        // 2. Lấy danh sách sản phẩm trong giỏ
        List<CartItem> allCartItems = cart.getCartItems();
        if (allCartItems.isEmpty())
            throw new APIException("Cart is empty");

        // 🔥 FIX LỖI 2: CHỈ LẤY SẢN PHẨM ĐƯỢC CHỌN (nếu có truyền selectedProductIds)
        List<CartItem> cartItemsToOrder;
        if (selectedProductIds != null && !selectedProductIds.isEmpty()) {
            cartItemsToOrder = allCartItems.stream()
                    .filter(item -> selectedProductIds.contains(item.getProduct().getProductId()))
                    .collect(Collectors.toList());
            if (cartItemsToOrder.isEmpty())
                throw new APIException("No selected products found in cart");
        } else {
            // Nếu không truyền selectedProductIds thì lấy tất cả (tương thích ngược)
            cartItemsToOrder = new ArrayList<>(allCartItems);
        }

        // 3. Tìm địa chỉ giao hàng
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        // 4. Tính phí ship
        long shippingFee = 35000;
        if (address.getCity() != null) {
            String city = address.getCity().toLowerCase();
            if (city.contains("hồ chí minh") || city.contains("hà nội") || city.contains("hcm")
                    || city.contains("đà nẵng")) {
                shippingFee = 15000;
            } else if (city.contains("long an") || city.contains("bình dương") || city.contains("đồng nai")
                    || city.contains("vũng tàu")) {
                shippingFee = 25000;
            }
        }

        // 🔥 TÍNH TỔNG TIỀN CHỈ CHO SẢN PHẨM ĐƯỢC CHỌN
        double selectedTotal = cartItemsToOrder.stream()
                .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                .sum();

        // 5. Khởi tạo đơn hàng
        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());

        double discountAmount = 0.0;
        if (orderRequest != null && orderRequest.getVoucherCode() != null) {
            Optional<Voucher> vOpt = voucherService.validateVoucher(orderRequest.getVoucherCode(), selectedTotal);
            if (vOpt.isPresent()) {
                Voucher v = vOpt.get();
                order.setVoucher(v);
                if ("PERCENTAGE".equals(v.getDiscountType())) {
                    discountAmount = (selectedTotal * v.getDiscountAmount()) / 100;
                } else {
                    discountAmount = v.getDiscountAmount();
                }
            }
        }

        order.setTotalAmount(selectedTotal);
        order.setShippingFee((double) shippingFee);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(selectedTotal + shippingFee - discountAmount);
        order.setScheduledTime(orderRequest != null ? orderRequest.getScheduledTime() : null);

        order.setAddress(address);

        if ("CASH_ON_DELIVERY".equals(paymentMethod)) {
            order.setOrderStatus("Pending Confirmation");
        } else {
            order.setOrderStatus("Pending Payment");
        }

        // 6. Tạo Payment
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment = paymentRepo.save(payment);
        order.setPayment(payment);

        Order savedOrder = orderRepo.save(order);

        // 7. Chuyển sản phẩm ĐƯỢC CHỌN từ Cart sang Order
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItemsToOrder) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);

            // Trừ kho
            Product product = cartItem.getProduct();
            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new APIException("Product " + product.getProductName() + " is out of stock");
            }
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepo.save(product);
        }

        orderItemRepo.saveAll(orderItems);

        // 🔥 XÓA CHỈ CÁC SẢN PHẨM ĐÃ ĐẶT HÀNG - GIỮ LẠI SP KHÔNG TICK
        if (selectedProductIds != null && !selectedProductIds.isEmpty()) {
            System.out.println(">> [DEBUG] Selected Product IDs from App: " + selectedProductIds);

            // Lọc ra các CartItem cần xóa khỏi collection (để orphanRemoval xử lý)
            List<CartItem> itemsToRemove = cart.getCartItems().stream()
                    .filter(item -> selectedProductIds.contains(item.getProduct().getProductId()))
                    .collect(Collectors.toList());

            System.out.println(">> [DEBUG] Found " + itemsToRemove.size() + " items to remove from cart");

            if (!itemsToRemove.isEmpty()) {
                // Rất quan trọng: Set cart về null cho từng item để orphanRemoval nhận biết
                for (CartItem item : itemsToRemove) {
                    item.setCart(null);
                }
                cart.getCartItems().removeAll(itemsToRemove);

                // Cập nhật lại tổng tiền giỏ hàng (chỉ tính SP còn lại)
                double remainingTotal = cart.getCartItems().stream()
                        .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                        .sum();

                cart.setTotalPrice(remainingTotal);
                cartRepo.save(cart);
                System.out.println(">> [DEBUG] Cart updated and saved. Remaining items in cart object: "
                        + cart.getCartItems().size());
            } else {
                System.out.println(">> [DEBUG] No matching items found in cart to remove!");
            }
        }

        // 8. Tạo DTO trả về
        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);
        List<OrderItemDTO> orderItemDTOs = orderItems.stream()
                .map(item -> modelMapper.map(item, OrderItemDTO.class))
                .collect(Collectors.toList());
        orderDTO.setOrderItems(orderItemDTOs);

        // Lấy thông tin user
        User user = userRepo.findByEmail(emailId).orElse(null);
        if (user != null) {
            orderDTO.setFullName(user.getFirstName() + " " + user.getLastName());
            orderDTO.setMobileNumber(user.getMobileNumber());
        }

        return orderDTO;
    }

    @Override
    @Transactional
    public void finalizePayment(Long cartId) {
        cartItemRepo.deleteByCartId(cartId);
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));
        cart.setTotalPrice(0.0);
        cart.getCartItems().clear();
        cartRepo.save(cart);
    }

    @Override
    public List<OrderDTO> getOrdersByUser(String emailId) {
        List<Order> orders = orderRepo.findAllByEmail(emailId);
        User user = userRepo.findByEmail(emailId).orElse(null);

        return orders.stream().map(order -> {
            OrderDTO dto = modelMapper.map(order, OrderDTO.class);
            if (user != null) {
                dto.setFullName(user.getFirstName() + " " + user.getLastName());
                dto.setMobileNumber(user.getMobileNumber());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public OrderDTO getOrder(String emailId, Long orderId) {
        Order order = orderRepo.findOrderByEmailAndOrderId(emailId, orderId);
        if (order == null)
            throw new ResourceNotFoundException("Order", "orderId", orderId);

        OrderDTO dto = modelMapper.map(order, OrderDTO.class);
        User user = userRepo.findByEmail(emailId).orElse(null);
        if (user != null) {
            dto.setFullName(user.getFirstName() + " " + user.getLastName());
            dto.setMobileNumber(user.getMobileNumber());
        }
        return dto;
    }

    @Override
    public OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Order> pageOrders = orderRepo.findAll(pageDetails);

        List<OrderDTO> orderDTOs = pageOrders.getContent().stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .collect(Collectors.toList());

        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setContent(orderDTOs);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());
        return orderResponse;
    }

    @Override
    public OrderDTO updateOrder(String emailId, Long orderId, String orderStatus) {
        Order order = orderRepo.findOrderByEmailAndOrderId(emailId, orderId);
        if (order == null)
            throw new ResourceNotFoundException("Order", "orderId", orderId);
        order.setOrderStatus(orderStatus);
        return modelMapper.map(order, OrderDTO.class);
    }

    @Override
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        return modelMapper.map(order, OrderDTO.class);
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, String orderStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));

        String oldStatus = order.getOrderStatus();
        order.setOrderStatus(orderStatus);

        // 🔥 AWARD LOYALTY POINTS WHEN COMPLETED
        if (("Delivered".equalsIgnoreCase(orderStatus) || "Completed".equalsIgnoreCase(orderStatus))
                && !("Delivered".equalsIgnoreCase(oldStatus) || "Completed".equalsIgnoreCase(oldStatus))) {

            User user = userRepo.findByEmail(order.getEmail()).orElse(null);
            if (user != null) {
                // Award 1 point per 1000 VND spent
                long pointsToAward = (long) (order.getFinalAmount() / 1000);
                user.setLoyaltyPoints((user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0) + pointsToAward);
                userRepo.save(user);
                System.out.println(">> [DEBUG] Awarded " + pointsToAward + " points to " + user.getEmail());
            }
        }

        Order savedOrder = orderRepo.save(order);
        return modelMapper.map(savedOrder, OrderDTO.class);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!"Cancelled".equalsIgnoreCase(order.getOrderStatus())) {
            List<OrderItem> items = order.getOrderItems();
            if (items != null) {
                for (OrderItem item : items) {
                    Product p = item.getProduct();
                    p.setQuantity(p.getQuantity() + item.getQuantity());
                    productRepo.save(p);
                }
            }
        }
        order.setOrderStatus("Cancelled");
        orderRepo.save(order);
    }
}