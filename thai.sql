-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 30, 2026 at 12:33 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `thai`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `order_date` datetime DEFAULT current_timestamp(),
  `total_price` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `address`, `payment_method`, `total_amount`, `order_date`, `total_price`, `status`) VALUES
(1, 1, NULL, NULL, NULL, '2026-03-21 21:34:50', 1580, 'paid'),
(2, 1, NULL, NULL, NULL, '2026-03-30 00:43:52', 990, 'cancelled'),
(3, 1, NULL, NULL, NULL, '2026-03-30 03:11:56', 990, 'cancelled'),
(4, 6, 'หกดหดห3443', 'transfer', 990.00, '2026-03-30 04:42:58', 0, 'cancelled'),
(5, 6, 'ดกหดหด', 'cod', 590.00, '2026-03-30 04:44:43', 0, 'cancelled'),
(6, 6, 'หกกหกหก', 'transfer', 1290.00, '2026-03-30 04:45:34', 0, 'cancelled'),
(7, 6, 'หกหก', 'transfer', 1580.00, '2026-03-30 04:59:15', 0, 'cancelled'),
(8, 6, 'หกหก', 'transfer', 990.00, '2026-03-30 05:12:49', 0, 'cancelled'),
(9, 6, 'เกเกกเ', 'transfer', 990.00, '2026-03-30 05:28:36', 0, 'cancelled');

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `detail_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`detail_id`, `order_id`, `product_id`, `quantity`, `subtotal`) VALUES
(1, 1, 1, 1, 990),
(2, 1, 3, 1, 590),
(3, 2, 2, 1, 990),
(4, 3, 3, 1, 990),
(5, 4, 3, 1, 990),
(6, 5, 9, 1, 590),
(7, 6, 6, 1, 1290),
(8, 7, 3, 1, 990),
(9, 7, 9, 1, 590),
(10, 8, 8, 1, 990),
(11, 9, 8, 1, 990);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(64) NOT NULL,
  `product_img` varchar(255) DEFAULT NULL,
  `product_type_id` int(11) NOT NULL,
  `product_size_id` int(11) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `product_img`, `product_type_id`, `product_size_id`, `price`) VALUES
(1, 'เสื้อแข่งทีมชาติไทย 2024 Home (Blue)', 'blue_jersey.jpg', 3, 2, 990),
(2, 'เสื้อแข่งทีมชาติไทย 2024 Away (Red)', 'red_jersey.jpg', 4, 3, 990),
(3, 'เสื้อแข่งทีมชาติไทย 2024 Third (Orange)', 'training_black.jpg', 1, 4, 990),
(4, 'เสื้อซ้อม Warrix Training (Black)', 'black.jpg', 2, 2, 590),
(5, 'เสื้อโปโลทีมชาติไทย (White)', 'polowithe.jpg', 2, 3, 790),
(6, 'เสื้อวอร์มทีมชาติไทย Grand Sport', 'Grand_Sport.jpg', 1, 4, 1290),
(7, 'เสื้อทีมชาติไทย 2024 (น้ำเงิน)', 'blue_2024.jpg', 1, 2, 990),
(8, 'เสื้อทีมชาติไทย 2024 (แดง)', '1774808199978_red_2024.png', 1, 3, 990),
(9, 'เสื้อซ้อม Warrix (เทา)', 'warrix_gray.jpg', 2, 2, 590);

-- --------------------------------------------------------

--
-- Table structure for table `product_size`
--

CREATE TABLE `product_size` (
  `product_size_id` int(11) NOT NULL,
  `product_size_name` varchar(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_size`
--

INSERT INTO `product_size` (`product_size_id`, `product_size_name`) VALUES
(2, 'M'),
(3, 'L'),
(4, 'XL'),
(5, 'S'),
(6, 'M'),
(7, 'L'),
(8, 'XL'),
(9, '2XL');

-- --------------------------------------------------------

--
-- Table structure for table `product_type`
--

CREATE TABLE `product_type` (
  `product_type_id` int(11) NOT NULL,
  `product_type_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_type`
--

INSERT INTO `product_type` (`product_type_id`, `product_type_name`) VALUES
(1, 'เสื้อแข่ง'),
(2, 'เสื้อซ้อม'),
(3, 'เสื้อแข่ง Home'),
(4, 'เสื้อแข่ง Away');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'member');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(64) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role_id`, `created_at`) VALUES
(1, 'admin_artty', '81dc9bdb52d04dc20036dbd8313ed055', 1, '2026-03-29 20:21:48'),
(2, 'test_user', '81dc9bdb52d04dc20036dbd8313ed055', 2, '2026-03-29 20:21:48'),
(3, 'admin', '81dc9bdb52d04dc20036dbd8313ed055', 1, '2026-03-29 20:21:48'),
(5, 'aum', '81dc9bdb52d04dc20036dbd8313ed055', 2, '2026-03-29 20:21:48'),
(6, 'artty', '81dc9bdb52d04dc20036dbd8313ed055', 2, '2026-03-29 21:08:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_order_user` (`user_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `fk_detail_order` (`order_id`),
  ADD KEY `fk_detail_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `product_type_id` (`product_type_id`),
  ADD KEY `product_size_id` (`product_size_id`);

--
-- Indexes for table `product_size`
--
ALTER TABLE `product_size`
  ADD PRIMARY KEY (`product_size_id`);

--
-- Indexes for table `product_type`
--
ALTER TABLE `product_type`
  ADD PRIMARY KEY (`product_type_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_size`
--
ALTER TABLE `product_size`
  MODIFY `product_size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `product_type`
--
ALTER TABLE `product_type`
  MODIFY `product_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `fk_detail_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_detail_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`product_type_id`) REFERENCES `product_type` (`product_type_id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`product_size_id`) REFERENCES `product_size` (`product_size_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
