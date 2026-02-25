-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 25, 2026 lúc 06:54 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `example05`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `address_id` bigint(20) NOT NULL,
  `building_name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `pincode` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `street` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`address_id`, `building_name`, `city`, `country`, `pincode`, `state`, `street`) VALUES
(8, 'Landmark', 'Ha Noi', 'Vietnam', '100000', 'Ha Dong', 'Duong Chien Thang'),
(11, 'Toa nha A', 'Ha Noi', 'Vietnam', '100000', 'Dong Da', '123 Duong Lang'),
(15, 'Chung cu B', 'Ho Chi Minh', 'Vietnam', '700000', 'Quan 1', '456 Le Loi'),
(17, 'Chung cu Sky9', 'aaaaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaa', '700000', 'aaaaaaaaaaaaaaaaaa', 'Duong Quang Trung'),
(19, 'aaaaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaa', '123456', 'aaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaa'),
(20, 'Nhà Trọ', 'Hồ Chí Minh', 'Việt Nam', '123456', 'Quận 9', 'Đỗ Xuân Hợp'),
(21, 'Hâhhah', 'Hồ Chí Minh', 'Việt Nam', '123456', 'Quận 9', 'Phước Long B'),
(23, 'cao đẳng công thương', 'hồ chí minh', 'Viet Nam', '123456', 'quận 9', 'phước long b'),
(24, 'Cao đẳng Công Thương', 'Hồ Chí Minhhh', 'Viet Nam', '123456', 'Long An', 'Phước Long A'),
(25, 'LandMark 83', 'Hồ Chí Minh', 'Vietnam', '123456', 'Vietnam', 'Đường Lê Lợi'),
(26, 'Nhà Con Ngân', 'Bình Dương', 'Vietnam', '369517', 'Vietnam', 'Đường Nhà Nó'),
(27, 'VinHome', 'Khánh Hòa', 'Vietnam', '365874', 'Vietnam', 'Đường Quận 9'),
(28, 'Nhà Tù', 'Đồng Nai', 'Việt Nam', '123456', 'Định Quán', 'Ấp Hiệp Đòng'),
(29, 'LandMark 84', 'Thanh Hóa', 'Vietnam', '987456', 'Vietnam', 'Đường Lê Lết'),
(30, '619dffffffffffff', 'Đồng Nai', 'Vietnam', '587462', 'Vietnam', 'Âp Hiệp Đồng'),
(31, 'VinHome', 'Đồng Nai', 'Việt Nam', '789456', 'Định Quán', 'Đỗ Xuân Thu');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `cart_id` bigint(20) NOT NULL,
  `total_price` double DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`cart_id`, `total_price`, `user_id`) VALUES
(1, 0, 8),
(2, 195000, 6),
(3, 75000, 7),
(4, 0, 9),
(5, 720000, 10),
(6, 65000, 11),
(7, 635000, 12),
(8, 0, 13),
(9, 0, 14),
(10, 65000, 15),
(12, 237450, 17),
(13, 0, 18);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` bigint(20) NOT NULL,
  `discount` double NOT NULL,
  `product_price` double NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `cart_id` bigint(20) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `discount`, `product_price`, `quantity`, `cart_id`, `product_id`) VALUES
(2, 0, 65000, 3, 2, 1),
(3, 0, 15000, 5, 3, 3),
(6, 0, 65000, 1, 6, 1),
(18, 0, 65000, 3, 5, 1),
(19, 7, 32550, 2, 5, 4),
(22, 10, 135000, 3, 5, 2),
(23, 0, 15000, 1, 5, 3),
(24, 5, 39900, 1, 5, 5),
(130, 0, 65000, 1, 10, 1),
(156, 7, 32550, 1, 12, 4),
(157, 0, 15000, 2, 12, 3),
(158, 5, 39900, 1, 12, 5),
(162, 0, 65000, 1, NULL, 1),
(163, 0, 15000, 3, NULL, 3),
(164, 10, 135000, 1, NULL, 2),
(165, 7, 32550, 4, NULL, 4),
(166, 8, 118680, 1, NULL, 252),
(167, 0, 65000, 7, NULL, 1),
(168, 10, 135000, 7, NULL, 2),
(169, 0, 15000, 1, 12, 302),
(170, 0, 15000, 1, 12, 303),
(171, 0, 105000, 1, 12, 306),
(180, 7, 32550, 2, NULL, 4),
(183, 8, 118680, 4, NULL, 252),
(207, 0, 15000, 21, 7, 3),
(208, 0, 42000, 2, NULL, 310),
(209, 5, 128250, 1, NULL, 308),
(210, 0, 15000, 1, 7, 303),
(211, 0, 65000, 1, 7, 1),
(212, 7, 32550, 2, 7, 4),
(213, 5, 39900, 1, 7, 5),
(214, 10, 135000, 1, 7, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `category_id` bigint(20) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `image`) VALUES
(1, 'Burgers', 'ab09427a-c549-4a5b-88b6-245b2343afca.webp'),
(2, 'Pizza', 'eec8e703-a539-4f8a-aa9e-56e7cd890d8a.png'),
(3, 'Đồ uống', 'e67bc8b5-e633-43f4-a582-e5e0a50c5ff1.png'),
(4, 'Sandwich', 'e3b75fb3-904d-427e-94db-7274a24e11ce.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `order_date` date DEFAULT NULL,
  `order_status` varchar(255) DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `payment_id` bigint(20) DEFAULT NULL,
  `address_id` bigint(20) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `discount_amount` double DEFAULT NULL,
  `final_amount` double DEFAULT NULL,
  `scheduled_time` varchar(255) DEFAULT NULL,
  `shipping_fee` double DEFAULT NULL,
  `voucher_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`order_id`, `email`, `order_date`, `order_status`, `total_amount`, `payment_id`, `address_id`, `full_name`, `phone`, `discount_amount`, `final_amount`, `scheduled_time`, `shipping_fee`, `voucher_id`) VALUES
(1, 'khachhang_a@gmail.com', '2025-12-29', 'Pending', 195000, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'test2025@gmail.com', '2026-01-03', 'Cancelled', 680100, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'test2025@gmail.com', '2026-01-03', 'Order Accepted!', 80000, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'test2025@gmail.com', '2026-01-03', 'Order Accepted!', 135000, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'test2025@gmail.com', '2026-01-03', 'Cancelled', 39900, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'test2025@gmail.com', '2026-01-03', 'Cancelled', 65000, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'test2025@gmail.com', '2026-01-03', 'Order Accepted!', 65000, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'test2025@gmail.com', '2026-01-03', 'Order Accepted!', 65000, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'nguyentruong23082005@gmail.com', '2026-01-05', 'Delivered', 65000, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'nguyentruong23082005@gmail.com', '2026-01-05', 'Delivered', 135000, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'nguyentruong23082005@gmail.com', '2026-01-05', 'Delivered', 15000, 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 39900, 14, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 65000, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 65000, 16, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 135000, 17, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 80000, 18, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 47550, 19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Delivered', 150000, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'nguyentruong23082005@gmail.com', '2026-01-06', 'Order Accepted!', 65000, 21, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Cancelled', 130000, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Order Accepted!', 65000, 26, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Order Accepted!', 80000, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Order Accepted!', 135000, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Order Accepted!', 65000, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Order Accepted!', 145000, 31, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'nguyentruong23082005@gmail.com', '2026-01-07', 'Order Accepted!', 15000, 32, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'nguyentruong23082005@gmail.com', '2026-01-09', 'Delivered', 1204200, 33, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'nguyentruong23082005@gmail.com', '2026-01-09', 'Order Accepted!', 65000, 34, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 35, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 150000, 36, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 150000, 37, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 38, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 39, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 40, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 41, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 30000, 42, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 30000, 43, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 44, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 80000, 45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'nguyentruong23082005@gmail.com', '2026-01-14', 'Order Accepted!', 520500, 46, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 87450, 51, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 15000, 52, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 142550, 53, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 0, 54, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 215000, 55, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 127950, 56, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(57, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 135000, 57, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(58, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 254580, 58, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 247550, 59, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(60, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 215000, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 200000, 61, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 215000, 62, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 80000, 63, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 80000, 64, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 80000, 65, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 80000, 66, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 'ngan@gmail.com', '2026-01-15', 'Order Accepted!', 145000, 67, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(68, 'ngan@gmail.com', '2026-01-15', 'Cancelled', 145000, 68, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 'ngan@gmail.com', '2026-01-15', 'Cancelled', 145000, 69, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, 'ngan@gmail.com', '2026-01-15', 'Cancelled', 145000, 70, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 130000, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 150000, 72, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 'ngan@gmail.com', '2026-01-15', 'Delivered', 80000, 73, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 400500, 74, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(75, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 400500, 75, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(76, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 400500, 76, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(77, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 400500, 77, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(78, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 30000, 78, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(79, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 54900, 79, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(80, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 330000, 80, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(81, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 81, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 82, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 83, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(84, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 84, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(85, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 85, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(86, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 86, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(87, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 87, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(88, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 88, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(89, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 89, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(90, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 90, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(91, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 91, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(92, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 92, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 93, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(94, 'ngan@gmail.com', '2026-01-15', 'Pending Confirmation', 200000, 94, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(95, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 95, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(96, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 96, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(97, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 97, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(98, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 98, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(99, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 99, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(100, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 100, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(101, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 101, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(102, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 102, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(103, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 103, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(104, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 104, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(105, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 105, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(106, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 106, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(107, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 107, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(108, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 108, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(109, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 109, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(110, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 110, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(111, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 111, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(116, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 65000, 116, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(117, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 117, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(118, 'ngan@gmail.com', '2026-01-15', 'Pending Payment', 200000, 118, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(119, 'ngan@gmail.com', '2026-01-15', 'Order Accepted', 200000, 119, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(120, 'ngan@gmail.com', '2026-01-15', 'Pending Confirmation', 200000, 120, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(121, 'ngan@gmail.com', '2026-01-15', 'Cancelled', 325000, 121, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(122, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 122, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(123, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 123, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(124, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 124, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(125, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 125, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(126, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 126, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(127, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 127, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(128, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 128, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(129, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 129, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(130, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 130, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(131, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 131, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(132, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 1200000, 132, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(133, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Order Accepted', 1200000, 133, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(134, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Cancelled', 1235000, 134, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(135, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Order Accepted', 1235000, 135, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(136, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Delivered', 559900, 136, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(137, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Cancelled', 1265000, 137, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(138, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Cancelled', 95000, 138, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(139, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Order Accepted', 95000, 139, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(140, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 165000, 140, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(141, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Payment', 200000, 141, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(142, 'nguyentruong23082005@gmail.com', '2026-01-15', 'Pending Confirmation', 165000, 142, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(143, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Pending Payment', 830300, 143, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(144, 'nhi@gmail.com', '2026-01-16', 'Order Accepted', 255000, 144, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(145, 'nhi@gmail.com', '2026-01-16', 'Order Accepted', 157350, 145, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(146, 'nhi@gmail.com', '2026-01-16', 'Cancelled', 132450, 146, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(147, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Pending Payment', 1673470, 147, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(148, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Pending Payment', 1673470, 148, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(149, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Pending Confirmation', 1673470, 149, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(153, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Order Accepted', 150000, 153, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(154, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Order Accepted', 202550, 154, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(155, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Order Accepted', 235000, 155, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(156, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Pending Confirmation', 80000, 156, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(157, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Order Accepted', 215000, 157, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(158, 'nguyentruong23082005@gmail.com', '2026-01-16', 'Delivered', 178680, 158, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(159, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Shipped', 600200, 159, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(160, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Order Accepted', 960000, 160, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(161, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Cancelled', 80100, 161, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(162, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Pending Confirmation', 489720, 162, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(163, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Pending Payment', 630500, 163, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(164, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Pending Payment', 128250, 164, 20, NULL, NULL, 0, 143250, '11:00 - 12:00', 15000, NULL),
(165, 'nguyentruong23082005@gmail.com', '2026-01-17', 'Pending Payment', 84000, 165, 20, NULL, NULL, 20000, 79000, 'ASAP', 15000, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` bigint(20) NOT NULL,
  `discount` double NOT NULL,
  `ordered_product_price` double NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `discount`, `ordered_product_price`, `quantity`, `order_id`, `product_id`) VALUES
(1, 0, 65000, 3, 1, 1),
(2, 0, 65000, 3, 2, 1),
(3, 10, 135000, 3, 2, 2),
(4, 0, 15000, 1, 2, 3),
(5, 7, 32550, 2, 2, 4),
(6, 0, 65000, 1, 3, 1),
(7, 0, 15000, 1, 3, 3),
(8, 10, 135000, 1, 5, 2),
(9, 5, 39900, 1, 6, 5),
(10, 0, 65000, 1, 7, 1),
(11, 0, 65000, 1, 8, 1),
(12, 0, 65000, 1, 9, 1),
(13, 0, 65000, 1, 10, 1),
(14, 10, 135000, 1, 12, 2),
(15, 0, 15000, 1, 13, 3),
(16, 5, 39900, 1, 14, 5),
(17, 0, 65000, 1, 15, 1),
(18, 0, 65000, 1, 16, 1),
(19, 10, 135000, 1, 17, 2),
(20, 0, 65000, 1, 18, 1),
(21, 7, 32550, 1, 19, 4),
(22, 10, 135000, 1, 20, 2),
(23, 0, 65000, 1, 21, 1),
(24, 0, 65000, 2, 25, 1),
(25, 0, 65000, 1, 26, 1),
(26, 0, 65000, 1, 28, 1),
(27, 10, 135000, 1, 29, 2),
(28, 0, 65000, 1, 30, 1),
(29, 0, 65000, 2, 31, 1),
(30, 0, 15000, 1, 31, 3),
(31, 0, 15000, 1, 32, 3),
(32, 10, 135000, 5, 33, 2),
(33, 0, 15000, 14, 33, 3),
(34, 5, 39900, 8, 33, 5),
(35, 0, 65000, 1, 34, 1),
(36, 0, 65000, 1, 35, 1),
(37, 10, 135000, 1, 36, 2),
(38, 10, 135000, 1, 37, 2),
(39, 0, 65000, 1, 38, 1),
(40, 0, 65000, 1, 39, 1),
(41, 0, 65000, 1, 40, 1),
(42, 0, 65000, 1, 41, 1),
(43, 0, 15000, 1, 42, 3),
(44, 0, 15000, 1, 43, 3),
(45, 0, 65000, 1, 44, 1),
(46, 0, 65000, 1, 45, 1),
(47, 0, 65000, 3, 46, 1),
(48, 10, 135000, 2, 46, 2),
(49, 0, 15000, 1, 46, 3),
(50, 10, 40500, 1, 46, 6),
(63, 5, 39900, 1, 51, 5),
(64, 0, 15000, 1, 51, 3),
(65, 7, 32550, 1, 51, 4),
(66, 5, 39900, 1, 52, 5),
(67, 0, 15000, 1, 52, 3),
(68, 7, 32550, 1, 52, 4),
(69, 0, 65000, 1, 53, 1),
(70, 10, 135000, 1, 53, 2),
(71, 0, 15000, 1, 53, 3),
(72, 0, 65000, 1, 54, 1),
(73, 10, 135000, 1, 54, 2),
(74, 0, 15000, 1, 54, 3),
(75, 0, 65000, 1, 55, 1),
(76, 10, 135000, 1, 55, 2),
(77, 7, 32550, 1, 56, 4),
(78, 10, 40500, 1, 56, 6),
(79, 5, 39900, 1, 56, 5),
(80, 10, 135000, 1, 57, 2),
(81, 8, 118680, 1, 58, 252),
(82, 10, 40500, 2, 58, 6),
(83, 5, 39900, 1, 58, 5),
(84, 0, 65000, 1, 59, 1),
(85, 10, 135000, 1, 59, 2),
(86, 7, 32550, 1, 59, 4),
(87, 0, 65000, 1, 60, 1),
(88, 10, 135000, 1, 60, 2),
(89, 0, 65000, 1, 61, 1),
(90, 10, 135000, 1, 61, 2),
(91, 10, 135000, 1, 62, 2),
(92, 0, 65000, 1, 62, 1),
(93, 0, 65000, 1, 63, 1),
(94, 0, 65000, 1, 64, 1),
(95, 0, 65000, 1, 65, 1),
(96, 0, 65000, 1, 66, 1),
(97, 0, 65000, 2, 67, 1),
(98, 0, 65000, 2, 68, 1),
(99, 0, 65000, 2, 69, 1),
(100, 0, 65000, 2, 70, 1),
(101, 0, 65000, 2, 71, 1),
(102, 10, 135000, 1, 72, 2),
(103, 0, 65000, 1, 73, 1),
(104, 0, 65000, 3, 74, 1),
(105, 0, 15000, 1, 74, 3),
(106, 10, 40500, 1, 74, 6),
(107, 10, 135000, 1, 74, 2),
(108, 0, 65000, 3, 75, 1),
(109, 0, 15000, 1, 75, 3),
(110, 10, 40500, 1, 75, 6),
(111, 10, 135000, 1, 75, 2),
(112, 0, 65000, 3, 76, 1),
(113, 0, 15000, 1, 76, 3),
(114, 10, 40500, 1, 76, 6),
(115, 10, 135000, 1, 76, 2),
(116, 0, 65000, 3, 77, 1),
(117, 0, 15000, 1, 77, 3),
(118, 10, 40500, 1, 77, 6),
(119, 10, 135000, 1, 77, 2),
(120, 0, 15000, 1, 78, 3),
(121, 5, 39900, 1, 79, 5),
(122, 0, 65000, 3, 80, 1),
(123, 10, 135000, 1, 80, 2),
(124, 0, 65000, 1, 81, 1),
(125, 10, 135000, 1, 81, 2),
(126, 0, 65000, 1, 82, 1),
(127, 10, 135000, 1, 82, 2),
(128, 0, 65000, 1, 83, 1),
(129, 10, 135000, 1, 83, 2),
(130, 0, 65000, 1, 84, 1),
(131, 10, 135000, 1, 84, 2),
(132, 0, 65000, 1, 85, 1),
(133, 10, 135000, 1, 85, 2),
(134, 0, 65000, 1, 86, 1),
(135, 10, 135000, 1, 86, 2),
(136, 0, 65000, 1, 87, 1),
(137, 10, 135000, 1, 87, 2),
(138, 0, 65000, 1, 88, 1),
(139, 10, 135000, 1, 88, 2),
(140, 0, 65000, 1, 89, 1),
(141, 10, 135000, 1, 89, 2),
(142, 0, 65000, 1, 90, 1),
(143, 10, 135000, 1, 90, 2),
(144, 0, 65000, 1, 91, 1),
(145, 10, 135000, 1, 91, 2),
(146, 0, 65000, 1, 92, 1),
(147, 10, 135000, 1, 92, 2),
(148, 0, 65000, 1, 93, 1),
(149, 10, 135000, 1, 93, 2),
(150, 0, 65000, 1, 94, 1),
(151, 10, 135000, 1, 94, 2),
(152, 0, 65000, 1, 95, 1),
(153, 0, 65000, 1, 96, 1),
(154, 0, 65000, 1, 97, 1),
(155, 0, 65000, 1, 98, 1),
(156, 0, 65000, 1, 99, 1),
(157, 0, 65000, 1, 100, 1),
(158, 0, 65000, 1, 101, 1),
(159, 0, 65000, 1, 102, 1),
(160, 0, 65000, 1, 103, 1),
(161, 0, 65000, 1, 104, 1),
(162, 0, 65000, 1, 105, 1),
(163, 0, 65000, 1, 106, 1),
(164, 0, 65000, 1, 107, 1),
(165, 0, 65000, 1, 108, 1),
(166, 0, 65000, 1, 109, 1),
(167, 0, 65000, 1, 110, 1),
(168, 0, 65000, 1, 111, 1),
(169, 0, 65000, 1, 116, 1),
(170, 10, 135000, 1, 117, 2),
(171, 0, 65000, 1, 117, 1),
(172, 10, 135000, 1, 118, 2),
(173, 0, 65000, 1, 118, 1),
(174, 10, 135000, 1, 119, 2),
(175, 0, 65000, 1, 119, 1),
(176, 10, 135000, 1, 120, 2),
(177, 0, 65000, 1, 120, 1),
(178, 0, 65000, 5, 121, 1),
(179, 0, 65000, 6, 122, 1),
(180, 10, 135000, 6, 122, 2),
(181, 0, 65000, 6, 123, 1),
(182, 10, 135000, 6, 123, 2),
(183, 0, 65000, 6, 124, 1),
(184, 10, 135000, 6, 124, 2),
(185, 0, 65000, 6, 125, 1),
(186, 10, 135000, 6, 125, 2),
(187, 0, 65000, 6, 126, 1),
(188, 10, 135000, 6, 126, 2),
(189, 0, 65000, 6, 127, 1),
(190, 10, 135000, 6, 127, 2),
(191, 0, 65000, 6, 128, 1),
(192, 10, 135000, 6, 128, 2),
(193, 0, 65000, 6, 129, 1),
(194, 10, 135000, 6, 129, 2),
(195, 0, 65000, 6, 130, 1),
(196, 10, 135000, 6, 130, 2),
(197, 0, 65000, 6, 131, 1),
(198, 10, 135000, 6, 131, 2),
(199, 0, 65000, 6, 132, 1),
(200, 10, 135000, 6, 132, 2),
(201, 0, 65000, 6, 133, 1),
(202, 10, 135000, 6, 133, 2),
(203, 0, 65000, 6, 134, 1),
(204, 10, 135000, 6, 134, 2),
(205, 0, 65000, 6, 135, 1),
(206, 10, 135000, 6, 135, 2),
(207, 0, 65000, 1, 136, 1),
(208, 10, 135000, 1, 136, 2),
(209, 0, 15000, 10, 136, 3),
(210, 7, 32550, 2, 136, 4),
(211, 5, 39900, 2, 136, 5),
(212, 0, 65000, 6, 137, 1),
(213, 10, 135000, 6, 137, 2),
(214, 0, 65000, 1, 138, 1),
(215, 0, 65000, 1, 139, 1),
(216, 10, 135000, 1, 140, 2),
(217, 10, 135000, 1, 141, 2),
(218, 10, 135000, 1, 142, 2),
(219, 5, 39900, 2, 143, 5),
(220, 0, 65000, 4, 143, 1),
(221, 10, 135000, 3, 143, 2),
(222, 10, 40500, 1, 143, 6),
(223, 0, 15000, 1, 143, 3),
(224, 0, 65000, 1, 144, 1),
(225, 10, 135000, 1, 144, 2),
(226, 7, 32550, 1, 145, 4),
(227, 0, 15000, 1, 145, 3),
(228, 5, 39900, 2, 145, 5),
(229, 7, 32550, 1, 146, 4),
(230, 0, 15000, 2, 146, 3),
(231, 5, 39900, 1, 146, 5),
(232, 5, 39900, 3, 147, 5),
(233, 0, 65000, 5, 147, 1),
(234, 10, 135000, 4, 147, 2),
(235, 10, 40500, 3, 147, 6),
(236, 0, 15000, 2, 147, 3),
(237, 8, 118680, 4, 147, 252),
(238, 7, 32550, 1, 147, 4),
(239, 5, 39900, 3, 148, 5),
(240, 0, 65000, 5, 148, 1),
(241, 10, 135000, 4, 148, 2),
(242, 10, 40500, 3, 148, 6),
(243, 0, 15000, 2, 148, 3),
(244, 8, 118680, 4, 148, 252),
(245, 7, 32550, 1, 148, 4),
(246, 5, 39900, 3, 149, 5),
(247, 0, 65000, 5, 149, 1),
(248, 10, 135000, 4, 149, 2),
(249, 10, 40500, 3, 149, 6),
(250, 0, 15000, 2, 149, 3),
(251, 8, 118680, 4, 149, 252),
(252, 7, 32550, 1, 149, 4),
(256, 10, 135000, 1, 153, 2),
(257, 10, 135000, 1, 154, 2),
(258, 7, 32550, 1, 154, 4),
(259, 0, 65000, 1, 155, 1),
(260, 10, 135000, 1, 155, 2),
(261, 0, 65000, 1, 156, 1),
(262, 0, 65000, 1, 157, 1),
(263, 10, 135000, 1, 157, 2),
(264, 0, 15000, 3, 158, 3),
(265, 8, 118680, 1, 158, 252),
(266, 7, 32550, 4, 159, 4),
(267, 0, 65000, 7, 159, 1),
(268, 10, 135000, 7, 160, 2),
(269, 7, 32550, 2, 161, 4),
(270, 8, 118680, 4, 162, 252),
(271, 10, 40500, 1, 163, 6),
(272, 0, 15000, 16, 163, 3),
(273, 0, 65000, 1, 163, 1),
(274, 10, 135000, 2, 163, 2),
(275, 5, 128250, 1, 164, 308),
(276, 0, 42000, 2, 165, 310);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `payment_id` bigint(20) NOT NULL,
  `payment_method` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`payment_id`, `payment_method`) VALUES
(1, '195000'),
(2, 'CASH_ON_DELIVERY'),
(3, 'VISA'),
(5, 'CASH_ON_DELIVERY'),
(6, 'CASH_ON_DELIVERY'),
(7, 'CASH_ON_DELIVERY'),
(8, 'CASH_ON_DELIVERY'),
(9, 'MOMO_WALLET'),
(10, 'MOMO_WALLET'),
(12, 'MOMO_WALLET'),
(13, 'MOMO_WALLET'),
(14, 'MOMO_WALLET'),
(15, 'MOMO_WALLET'),
(16, 'MOMO_WALLET'),
(17, 'MOMO_WALLET'),
(18, 'MOMO_WALLET'),
(19, 'MOMO_WALLET'),
(20, 'MOMO_WALLET'),
(21, 'CASH_ON_DELIVERY'),
(25, 'CASH_ON_DELIVERY'),
(26, 'CASH_ON_DELIVERY'),
(28, 'MOMO_WALLET'),
(29, 'CASH_ON_DELIVERY'),
(30, 'CASH_ON_DELIVERY'),
(31, 'CASH_ON_DELIVERY'),
(32, 'CASH_ON_DELIVERY'),
(33, 'CASH_ON_DELIVERY'),
(34, 'CASH_ON_DELIVERY'),
(35, 'MOMO_WALLET'),
(36, 'MOMO_WALLET'),
(37, 'MOMO_WALLET'),
(38, 'MOMO_WALLET'),
(39, 'MOMO_WALLET'),
(40, 'MOMO_WALLET'),
(41, 'MOMO_WALLET'),
(42, 'MOMO_WALLET'),
(43, 'MOMO_WALLET'),
(44, 'MOMO_WALLET'),
(45, 'MOMO_WALLET'),
(46, 'CASH'),
(51, 'CASH_ON_DELIVERY'),
(52, 'MOMO_WALLET'),
(53, 'MOMO_WALLET'),
(54, 'CASH_ON_DELIVERY'),
(55, 'MOMO_WALLET'),
(56, 'MOMO_WALLET'),
(57, 'CASH_ON_DELIVERY'),
(58, 'MOMO_WALLET'),
(59, 'MOMO_WALLET'),
(60, 'MOMO_WALLET'),
(61, 'CASH_ON_DELIVERY'),
(62, 'MOMO_WALLET'),
(63, 'MOMO_WALLET'),
(64, 'MOMO_WALLET'),
(65, 'MOMO_WALLET'),
(66, 'MOMO_WALLET'),
(67, 'MOMO_WALLET'),
(68, 'MOMO_WALLET'),
(69, 'MOMO_WALLET'),
(70, 'MOMO_WALLET'),
(71, 'CASH_ON_DELIVERY'),
(72, 'MOMO_WALLET'),
(73, 'MOMO_WALLET'),
(74, 'MOMO_WALLET'),
(75, 'MOMO_WALLET'),
(76, 'MOMO_WALLET'),
(77, 'MOMO_WALLET'),
(78, 'MOMO_WALLET'),
(79, 'MOMO_WALLET'),
(80, 'CASH'),
(81, 'MOMO_WALLET'),
(82, 'MOMO_WALLET'),
(83, 'MOMO_WALLET'),
(84, 'MOMO_WALLET'),
(85, 'MOMO_WALLET'),
(86, 'MOMO_WALLET'),
(87, 'MOMO_WALLET'),
(88, 'MOMO_WALLET'),
(89, 'MOMO_WALLET'),
(90, 'MOMO_WALLET'),
(91, 'MOMO_WALLET'),
(92, 'MOMO_WALLET'),
(93, 'MOMO_WALLET'),
(94, 'CASH_ON_DELIVERY'),
(95, 'MOMO_WALLET'),
(96, 'MOMO_WALLET'),
(97, 'MOMO_WALLET'),
(98, 'MOMO_WALLET'),
(99, 'MOMO_WALLET'),
(100, 'MOMO_WALLET'),
(101, 'MOMO_WALLET'),
(102, 'MOMO_WALLET'),
(103, 'MOMO_WALLET'),
(104, 'MOMO_WALLET'),
(105, 'MOMO_WALLET'),
(106, 'MOMO_WALLET'),
(107, 'MOMO_WALLET'),
(108, 'MOMO_WALLET'),
(109, 'MOMO_WALLET'),
(110, 'MOMO_WALLET'),
(111, 'MOMO_WALLET'),
(116, 'MOMO_WALLET'),
(117, 'MOMO_WALLET'),
(118, 'MOMO_WALLET'),
(119, 'MOMO_WALLET'),
(120, 'CASH_ON_DELIVERY'),
(121, 'MOMO_WALLET'),
(122, 'MOMO_WALLET'),
(123, 'MOMO_WALLET'),
(124, 'MOMO_WALLET'),
(125, 'MOMO_WALLET'),
(126, 'MOMO_WALLET'),
(127, 'MOMO_WALLET'),
(128, 'MOMO_WALLET'),
(129, 'MOMO_WALLET'),
(130, 'MOMO_WALLET'),
(131, 'MOMO_WALLET'),
(132, 'MOMO_WALLET'),
(133, 'MOMO_WALLET'),
(134, 'MOMO_WALLET'),
(135, 'MOMO_WALLET'),
(136, 'MOMO_WALLET'),
(137, 'MOMO_WALLET'),
(138, 'MOMO_WALLET'),
(139, 'MOMO_WALLET'),
(140, 'MOMO_WALLET'),
(141, 'MOMO_WALLET'),
(142, 'CASH_ON_DELIVERY'),
(143, 'CASH'),
(144, 'MOMO_WALLET'),
(145, 'MOMO_WALLET'),
(146, 'CASH_ON_DELIVERY'),
(147, 'MOMO_WALLET'),
(148, 'MOMO_WALLET'),
(149, 'CASH_ON_DELIVERY'),
(153, 'MOMO_WALLET'),
(154, 'MOMO_WALLET'),
(155, 'MOMO_WALLET'),
(156, 'CASH_ON_DELIVERY'),
(157, 'MOMO_WALLET'),
(158, 'MOMO_WALLET'),
(159, 'MOMO_WALLET'),
(160, 'MOMO_WALLET'),
(161, 'MOMO_WALLET'),
(162, 'CASH_ON_DELIVERY'),
(163, 'CASH'),
(164, 'MOMO_WALLET'),
(165, 'MOMO_WALLET');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `product_id` bigint(20) NOT NULL,
  `description` varchar(255) NOT NULL,
  `discount` double NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` double NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `special_price` double NOT NULL,
  `category_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`product_id`, `description`, `discount`, `image`, `price`, `product_name`, `quantity`, `special_price`, `category_id`) VALUES
(1, 'Bánh mì kẹp thịt bò nướng lửa hồng, phô mai Cheddar.', 0, '38bd94c8-9cdc-4df5-9e63-6b3058e9820e.webp', 65000, 'Classic Beef Burger', 953, 65000, 1),
(2, 'Pizza đế giòn với xúc xích Pepperoni cay và phô mai Mozzarella.', 10, '5d61e986-60fd-4ea3-81e5-e90153f1aeec.png', 150000, 'Pizza Pepperoni', 951, 135000, 2),
(3, 'Nước ngọt có gas mát lạnh, sảng khoái.', 0, '81f095c1-aa2a-43be-bd1e-cf29cb1c5e06.png', 15000, 'Coca Cola Tươi', 83, 15000, 3),
(4, 'Bánh sandwich gà nướng sốt teriyaki, phô mai và rau', 7, 'cc28e3e8-4387-44b8-a576-bbdd83116d6c.png', 35000, 'Sandwich Gà Teriyaki', 18, 32550, 4),
(5, 'Bò áp chảo mềm, phô mai béo, xà lách, cà chua', 5, '1f51b506-0fb0-44a2-b17c-ff811711f83c.png', 42000, 'Sandwich Bò Phô Mai', 39, 39900, 4),
(6, 'Là sự kết hợp hoàn hảo giữa miếng gà chiên giòn rụm, lớp vỏ ngoài vàng ươm, bên trong mềm ngọt cùng bánh mì mềm mịn, xà lách tươi, cà chua và sốt đặc biệt của cửa hàng.', 10, 'ba63322b-f703-4b6c-a531-bc81c6172ffe.png', 45000, 'Hamburger Gà Rán', 95, 40500, 1),
(252, 'Pizza Hải Sản là sự kết hợp hoàn hảo giữa tôm, mực, thanh cua tươi ngon, phô mai Mozzarella béo ngậy và lớp đế bánh giòn xốp. Phủ trên cùng là sốt cà chua đặc biệt, mang đến hương vị biển cả đậm đà và hấp dẫn.', 8, '9eefd3cd-5039-432d-a4ea-9c65d39f866c.png', 129000, 'Pizza Hải Sản', 52, 118680, 2),
(302, 'Pepsi mang hương vị mạnh mẽ, mát lạnh, giúp bữa ăn thêm trọn vẹn và hấp dẫn hơn.', 0, '51a77c61-c33f-43ef-a5d8-1b03be0d6737.png', 15000, 'Pepsi', 179, 15000, 3),
(303, 'Sprite vị chanh tươi mát, giải khát nhanh, giúp giảm cảm giác ngấy khi ăn đồ chiên rán.', 0, 'e6d0b8be-7be0-42c0-85bf-c7576b531879.png', 15000, 'Sprite', 498, 15000, 3),
(304, 'Nước suối tinh khiết, đóng chai tiện lợi, phù hợp với mọi bữa ăn.', 0, 'ff06a83a-3074-447c-ba33-7c0aef304de6.webp', 10000, 'Nước Suối', 200, 10000, 3),
(305, 'Pizza Rau Củ tươi mát với nấm, bắp, hành tây, ớt chuông, cà chua – lựa chọn thanh đạm nhưng vẫn cực kỳ ngon miệng.', 0, 'e828ceea-45c9-4452-b79d-5534c454426b.png', 99000, 'Pizza Rau Củ', 50, 99000, 2),
(306, 'Pizza Phô Mai là lựa chọn hoàn hảo cho tín đồ phô mai với lớp Mozzarella, Cheddar tan chảy phủ kín mặt bánh, béo ngậy và thơm lừng.', 0, '753259ee-2b0a-4cda-aad4-e0a54e8ef72d.png', 105000, 'Pizza Phô Mai', 79, 105000, 2),
(307, 'Pizza Xúc Xích với xúc xích Đức cay nhẹ, kết hợp phô mai Mozzarella và sốt cà chua truyền thống tạo nên hương vị quen thuộc nhưng cực kỳ cuốn hút.', 0, '720be414-fb05-491f-8233-a2e0a5699da3.png', 110000, 'Pizza Xúc Xích', 100, 110000, 2),
(308, 'Pizza Bò với thịt bò mềm ngọt, ướp gia vị đậm đà, kết hợp hành tây, ớt chuông và phô mai kéo sợi tạo nên món ăn giàu năng lượng và hương vị khó quên.', 5, '741c203a-95c1-46f1-89fb-a4143ae34eba.png', 135000, 'Pizza Bò', 68, 128250, 2),
(309, 'Hamburger đặc biệt với 2 lớp thịt bò, phô mai kép, trứng ốp la và sốt nhà làm – lựa chọn hoàn hảo cho người ăn nhiều.', 7, 'ab914427-0e5d-47ca-9cfb-9a673432596b.png', 65000, 'Hamburger Đặc Biệt', 70, 60450, 1),
(310, 'Hamburger cá chiên giòn, vị thanh nhẹ, kết hợp phô mai và sốt tartar, thích hợp cho người không ăn thịt đỏ.', 0, '2c2953e3-96cd-4f53-ad36-51b51da9d9bb.png', 42000, 'Hamburger Cá', 86, 42000, 1),
(311, 'Sandwich thịt nguội với bánh mì mềm, thịt nguội thơm béo, kết hợp xà lách, cà chua và sốt mayonnaise tạo nên hương vị nhẹ nhàng nhưng đầy đủ dinh dưỡng.', 0, '79e3f231-b989-4b5b-a7f9-d0dea86fd58b.png', 35000, 'Sandwich Thịt Nguội', 60, 35000, 4),
(312, 'Sandwich gà nướng thơm lừng, thịt gà mềm, thấm gia vị, ăn kèm rau xanh tươi mát và sốt đặc biệt của cửa hàng.', 2, '189339f7-828d-462c-aff5-e5bb40d7f470.webp', 40000, 'Sandwich Gà Nướng', 100, 39200, 4),
(313, 'Sandwich cá ngừ giàu dinh dưỡng, kết hợp bắp, trứng luộc và sốt mayonnaise béo nhẹ, thích hợp cho bữa ăn nhanh lành mạnh.', 5, 'c4a623c7-26b5-432c-8c96-0ec4257c1a4e.png', 54000, 'Sandwich Cá Ngừ', 60, 51300, 4),
(314, 'Sandwich phô mai tan chảy, béo ngậy, thơm lừng – lựa chọn yêu thích của trẻ em và người ăn chay nhẹ.', 6, '1c04c6ca-e6ab-4a82-94c2-cfb78ff98d45.png', 32000, 'Sandwich Phô Mai', 80, 30080, 4),
(315, 'Sandwich Trứng Thịt Nguội Phô Mai là sự kết hợp hài hòa giữa trứng chiên mềm, thịt nguội thơm béo, phô mai tan chảy cùng bánh mì mềm nóng và rau xanh tươi mát.', 0, 'ae2c11c6-a2f2-4078-a6a6-251b78907dce.png', 48000, 'Sandwich Trứng Thị Nguội Phô Mai', 82, 48000, 4),
(316, 'Nước cam ép tươi nguyên chất, giàu vitamin C, tốt cho sức khỏe.', 0, '3bc4d0fb-2c98-4d9a-8529-496c54566960.jpg', 25000, 'Nước Cam Ép', 100, 25000, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products_seq`
--

CREATE TABLE `products_seq` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products_seq`
--

INSERT INTO `products_seq` (`next_val`) VALUES
(401);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `review_id` bigint(20) NOT NULL,
  `comment` varchar(500) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `review_date` datetime(6) DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`review_id`, `comment`, `rating`, `review_date`, `order_id`, `product_id`, `user_id`) VALUES
(1, 'ngon quá trời', 5, '2026-01-17 10:00:03.000000', 10, 1, 12),
(2, '', 5, '2026-01-17 10:02:12.000000', 12, 2, 12),
(3, '', 5, '2026-01-17 10:03:37.000000', 20, 2, 12),
(4, '', 5, '2026-01-17 10:03:42.000000', 136, 2, 12),
(5, 'đã quá pepsi ơi\n', 5, '2026-01-17 10:05:18.000000', 13, 3, 12),
(6, 'dsfsfdsffdsffdfdfs', 5, '2026-01-17 11:26:49.000000', 33, 2, 12),
(7, '', 5, '2026-01-17 20:31:38.000000', 33, 3, 12),
(8, '', 5, '2026-01-17 20:31:42.000000', 136, 1, 12),
(9, '', 5, '2026-01-17 20:32:53.000000', 33, 5, 12),
(10, '', 5, '2026-01-17 20:32:56.000000', 136, 5, 12);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `role_id` bigint(20) NOT NULL,
  `role_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(101, 'ADMIN'),
(102, 'USER');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `mobile_number` varchar(10) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `loyalty_points` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `email`, `first_name`, `last_name`, `mobile_number`, `password`, `reset_token`, `image`, `loyalty_points`) VALUES
(6, 'admin@gmail.com', 'Nguyen', 'TrucTruong', '0337050902', '$2a$12$lbVA00XFwnaiy79MuELFYut8OHyi2dezFMTRYDvPQIVG5ms8Cda5i', NULL, NULL, NULL),
(7, 'cuoi_cung_cung_duoc@gmail.com', 'Trann', 'ThanhCong', '0333444555', '$2a$10$4v0JUtMyZi73LiPUf2MPmuAza/cg0qEAgHOXQOWdqVtuRssuXzwe2', NULL, NULL, NULL),
(8, 'khachhang_a@gmail.com', 'Nguyen', 'VanAn', '0901234567', '$2a$10$oePqd8W3weTb8hiZ9jQ0murDm8L7fsZxlfgMnKg6ByhQn1LjeeviG', NULL, NULL, NULL),
(9, 'khachhang_b@gmail.com', 'TraTrann', 'ThiBaaa', '0909888777', '$2a$10$2sytlFuU60AJ.sHIIhyWMeJqTiRi16ISLZtdzReidpYBa9ehmT/nW', NULL, NULL, NULL),
(10, 'test2025@gmail.com', 'TraNNamm', 'NGUYEN', '0901234589', '$2a$10$wNpt8F/pQGMvlwq0/koHQO3aeyQMXY6Xg19mZA98wukxd5rLy6cP2', NULL, NULL, NULL),
(11, 'nguyen@gmail.com', 'Nguyenn', 'Nguyennnn', '0147852369', '$2a$10$k4DPx/vQcJG/xUCTq/8co.fl0a4Ig0/jskaBL.RJ/.QGuawHMqF4u', NULL, NULL, NULL),
(12, 'nguyentruong23082005@gmail.com', 'Trong', 'NguyenVan', '0373907866', '$2a$10$XdmwIIJzxB18NxuFGIXhDOLVY36bSOpMnvefZVf9iGcwtEZ.M.WIe', NULL, '7605fc12-d5ec-4956-a8c0-b8504d8222cc.jpg', 200),
(13, 'truong2308@gmail.com', 'Truonggg', 'Nguyen', '0337050903', '$2a$10$pbIZ6AWdOuGS/EfeSLHWm.4tq/G8zSfb5mYOSdn84m.UPsHOhSgIm', NULL, NULL, NULL),
(14, 'hoho@gmail.com', 'An', 'Nguyen', '0172583694', '$2a$10$D5NfvFKZj4Xw9KKa4Vbave0ptAjskegtKkBaqmnWgUDuXtI0rOL/u', NULL, NULL, NULL),
(15, 'ngan@gmail.com', 'Ngan', 'Nguyen', '0132749887', '$2a$10$rZ383qiCkgJhZ6Ac/pkcN.hS9zQVDYTcVz10UsksB710dkPi9wnxm', NULL, NULL, NULL),
(17, 'nhi@gmail.com', 'Nhi', 'Nguyen', '0316497510', '$2a$10$AA0FHHnDClEXHECo0X84tePjVNksO6Shg0IqRYKa3wS0OB6M5DUo.', NULL, NULL, NULL),
(18, 'ca@gmail.com', 'Ca', 'Tran', '0316987456', '$2a$10$ge7YwgFdbl0Uo0ZdVIsxbOugU6tDk82dM35gpIYp.35aw8YkyFf/C', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_address`
--

CREATE TABLE `user_address` (
  `user_id` bigint(20) NOT NULL,
  `address_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_address`
--

INSERT INTO `user_address` (`user_id`, `address_id`) VALUES
(6, 8),
(7, 8),
(8, 11),
(9, 15),
(10, 17),
(11, 19),
(13, 21),
(14, 23),
(15, 24),
(15, 25),
(15, 26),
(15, 27),
(12, 20),
(12, 29),
(17, 23),
(17, 30),
(18, 31);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_role`
--

CREATE TABLE `user_role` (
  `user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_role`
--

INSERT INTO `user_role` (`user_id`, `role_id`) VALUES
(6, 101),
(7, 102),
(8, 102),
(9, 102),
(10, 102),
(11, 102),
(12, 102),
(13, 101),
(13, 102),
(14, 101),
(14, 102),
(15, 101),
(15, 102),
(17, 101),
(17, 102),
(18, 101),
(18, 102);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
--

CREATE TABLE `vouchers` (
  `voucher_id` bigint(20) NOT NULL,
  `active` bit(1) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `discount_amount` double DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `min_order_amount` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `vouchers`
--

INSERT INTO `vouchers` (`voucher_id`, `active`, `code`, `discount_amount`, `discount_type`, `expiry_date`, `min_order_amount`) VALUES
(1, b'1', 'GIAM10', 10, 'PERCENTAGE', '2026-02-17', 100000),
(2, b'1', 'FREESHIP', 15000, 'FIXED', '2026-02-17', 50000),
(3, b'1', 'GIAM20K', 20000, 'FIXED', '2026-02-17', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `wishlist_id` bigint(20) NOT NULL,
  `added_date` datetime(6) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `wishlist_items`
--

INSERT INTO `wishlist_items` (`wishlist_id`, `added_date`, `product_id`, `user_id`) VALUES
(1, '2026-01-17 20:29:59.000000', 312, 12),
(2, '2026-01-17 20:30:01.000000', 311, 12),
(3, '2026-01-17 20:30:04.000000', 303, 12),
(5, '2026-01-17 20:40:35.000000', 1, 12),
(6, '2026-01-17 20:40:35.000000', 2, 12),
(7, '2026-01-17 20:40:36.000000', 3, 12),
(8, '2026-01-17 21:22:16.000000', 4, 12);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`),
  ADD UNIQUE KEY `UK64t7ox312pqal3p7fg9o503c2` (`user_id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD KEY `FKpcttvuq4mxppo8sxggjtn5i2c` (`cart_id`),
  ADD KEY `FK1re40cjegsfvw58xrkdp6bac6` (`product_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `UKhaujdjk1ohmeixjhnhslchrp1` (`payment_id`),
  ADD KEY `FKhlglkvf5i60dv6dn397ethgpt` (`address_id`),
  ADD KEY `FKdimvsocblb17f45ikjr6xn1wj` (`voucher_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  ADD KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `FKqwgq1lxgahsxdspnwqfac6sv6` (`order_id`),
  ADD KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`),
  ADD KEY `FKcgy7qjc1r99dp117y9en6lxye` (`user_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Chỉ mục cho bảng `user_address`
--
ALTER TABLE `user_address`
  ADD KEY `FKpv7y2l6mvly37lngi3doarqhd` (`address_id`),
  ADD KEY `FKrmincuqpi8m660j1c57xj7twr` (`user_id`);

--
-- Chỉ mục cho bảng `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FKt7e7djp752sqn6w22i6ocqy6q` (`role_id`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`voucher_id`),
  ADD UNIQUE KEY `UK30ftp2biebbvpik8e49wlmady` (`code`);

--
-- Chỉ mục cho bảng `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`wishlist_id`),
  ADD UNIQUE KEY `UKtp53unkks741xiqi6m620i7mx` (`user_id`,`product_id`),
  ADD KEY `FKqxj7lncd242b59fb78rqegyxj` (`product_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=215;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=277;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `voucher_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `wishlist_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `FKb5o626f86h46m4s7ms6ginnop` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`);

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK8aol9f99s97mtyhij0tvfj41f` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  ADD CONSTRAINT `FKdimvsocblb17f45ikjr6xn1wj` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`),
  ADD CONSTRAINT `FKhlglkvf5i60dv6dn397ethgpt` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `FKqwgq1lxgahsxdspnwqfac6sv6` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

--
-- Các ràng buộc cho bảng `user_address`
--
ALTER TABLE `user_address`
  ADD CONSTRAINT `FKpv7y2l6mvly37lngi3doarqhd` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`),
  ADD CONSTRAINT `FKrmincuqpi8m660j1c57xj7twr` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `FKj345gk1bovqvfame88rcx7yyx` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKt7e7djp752sqn6w22i6ocqy6q` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Các ràng buộc cho bảng `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `FKmmj2k1i459yu449k3h1vx5abp` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKqxj7lncd242b59fb78rqegyxj` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
