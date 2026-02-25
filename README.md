# 🍔 Food Ordering App - Full Stack Mobile Application

> Ứng dụng di động đặt đồ ăn đa nền tảng với AI chatbot hỗ trợ đặt món bằng giọng nói và hình ảnh.

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Tính năng](#-tính-năng)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Tác giả](#-tác-giả)

---

## 🌟 Tổng quan

Dự án **Food Ordering App** là một ứng dụng di động bán đồ ăn full-stack gồm 4 thành phần chính:

| Thành phần                      | Mô tả                                | Công nghệ                         |
| ------------------------------- | ------------------------------------ | --------------------------------- |
| **Backend API** (`example05/`)  | REST API server xử lý business logic | Spring Boot 3.3.3, Java 21        |
| **Mobile App** (`DemoApp/`)     | Ứng dụng di động cho khách hàng      | React Native, Expo 54, TypeScript |
| **Admin Panel** (`test-admin/`) | Trang quản trị cho admin             | React-Admin, Vite, MUI            |
| **AI Server** (`ServerAI/`)     | Chatbot AI hỗ trợ đặt món            | Python Flask, Google Gemini 2.5   |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Mobile App    │     │   Admin Panel    │     │   AI Server     │
│  (React Native) │     │  (React-Admin)   │     │  (Flask+Gemini) │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                         │
         │    REST API (JWT)     │    REST API (JWT)       │
         └───────────┬───────────┘                         │
                     │                                     │
              ┌──────▼──────┐          Fetch Menu          │
              │  Backend    │◄─────────────────────────────┘
              │ Spring Boot │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │   MySQL     │
              │  Database   │
              └─────────────┘
```

---

## 🛠️ Tech Stack

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.3.3 + Java 21
- **Database**: MySQL 8 + Spring Data JPA + Hibernate
- **Security**: Spring Security + JWT (java-jwt 4.2.1)
- **API Docs**: Swagger UI (springdoc-openapi 2.2.0)
- **Email**: Spring Boot Mail (Gmail SMTP)
- **Validation**: Spring Boot Validation
- **Mapper**: ModelMapper 3.1.1
- **Build**: Maven

### Mobile App (React Native)

- **Framework**: React Native 0.81.5 + Expo 54
- **Language**: TypeScript
- **Navigation**: Expo Router + React Navigation 7
- **State**: React Context API + AsyncStorage
- **UI/Animation**: Reanimated 4, Moti, Lottie, Expo Linear Gradient, Expo Blur
- **Media**: expo-image-picker, expo-av (audio recording), expo-speech (TTS)
- **HTTP**: Axios

### Admin Panel

- **Framework**: React-Admin 5.13 + React 19
- **UI Library**: MUI (Material UI) 7
- **Build Tool**: Vite 6
- **Language**: TypeScript

### AI Server

- **Framework**: Flask (Python)
- **AI Model**: Google Gemini 2.5 Flash
- **Features**: Xử lý text, image, audio (giọng nói)

---

## ✨ Tính năng

### 👤 Xác thực & Người dùng

- ✅ Đăng ký / Đăng nhập (JWT Token)
- ✅ Quên mật khẩu (OTP qua Email)
- ✅ Đổi mật khẩu
- ✅ Cập nhật thông tin cá nhân & ảnh đại diện
- ✅ Phân quyền (User / Admin)

### 🍔 Sản phẩm & Danh mục

- ✅ Danh sách sản phẩm phân trang
- ✅ Danh mục sản phẩm (CRUD)
- ✅ Tìm kiếm sản phẩm theo keyword
- ✅ Lọc sản phẩm theo danh mục
- ✅ Upload ảnh sản phẩm
- ✅ Giá gốc / Giá khuyến mãi (specialPrice)

### 🛒 Giỏ hàng

- ✅ Thêm / Xóa / Cập nhật số lượng
- ✅ Chọn riêng sản phẩm để thanh toán (Partial Checkout)
- ✅ Xóa nhiều sản phẩm cùng lúc
- ✅ Đồng bộ giỏ hàng real-time

### 📦 Đơn hàng & Thanh toán

- ✅ Đặt hàng với địa chỉ giao hàng
- ✅ Thanh toán COD (Tiền mặt)
- ✅ Tích hợp thanh toán MoMo
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Hủy đơn hàng
- ✅ Lịch sử đơn hàng

### 🎫 Voucher / Mã giảm giá

- ✅ CRUD Voucher (Admin)
- ✅ Áp dụng mã giảm giá khi đặt hàng

### ❤️ Wishlist (Yêu thích)

- ✅ Thêm / Xóa sản phẩm yêu thích
- ✅ Toggle wishlist (heart icon)

### ⭐ Đánh giá sản phẩm

- ✅ Đánh giá sao + bình luận
- ✅ Xem đánh giá trên trang chi tiết sản phẩm
- ✅ Quản lý đánh giá cá nhân

### 📍 Quản lý địa chỉ

- ✅ Thêm / Sửa / Xóa địa chỉ giao hàng
- ✅ Chọn địa chỉ khi đặt hàng

### 🤖 AI Chatbot (Gemini)

- ✅ Chat bằng text - hỏi về menu, giá cả
- ✅ Gửi hình ảnh để AI nhận diện món ăn
- ✅ Gửi tin nhắn thoại (voice message)
- ✅ AI tự động thêm món vào giỏ hàng
- ✅ Đề xuất món ăn thông minh
- ✅ Nhân vật AI cá nhân hóa (xưng "Em/Đệ")

### 🔧 Admin Panel

- ✅ Dashboard tổng quan
- ✅ Quản lý sản phẩm (CRUD + Upload ảnh)
- ✅ Quản lý danh mục (CRUD + Upload ảnh)
- ✅ Quản lý người dùng
- ✅ Quản lý đơn hàng (xem + cập nhật trạng thái)
- ✅ Quản lý giỏ hàng
- ✅ Quản lý voucher

### 📱 UI/UX

- ✅ Onboarding screens (3 bước)
- ✅ Dark mode / Light mode
- ✅ Đa ngôn ngữ (Language Context)
- ✅ Animations mượt (Reanimated, Moti, Lottie)
- ✅ Skeleton loading
- ✅ Responsive design

---

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống

| Phần mềm               | Phiên bản     |
| ---------------------- | ------------- |
| Java JDK               | 21+           |
| Node.js                | 18+           |
| Python                 | 3.10+         |
| MySQL                  | 8.0+          |
| Android Studio / Xcode | Mới nhất      |
| Expo CLI               | (cài qua npx) |

### 1️⃣ Clone Repository

```bash
git clone https://github.com/nguyentructruong2308-beep/react-native.git
cd react-native
```

### 2️⃣ Backend - Spring Boot (`example05/`)

**a. Tạo database MySQL và import dữ liệu mẫu:**

```sql
CREATE DATABASE example05;
```

```bash
mysql -u root -p example05 < example05.sql
```

> 💡 Nếu MySQL của bạn **có mật khẩu root**, mở file `example05/src/main/resources/application.properties` và sửa dòng:
>
> ```properties
> spring.datasource.password=YOUR_MYSQL_PASSWORD
> ```

**b. Chạy Backend:**

```bash
cd example05
./mvnw spring-boot:run
```

> Server chạy tại: `http://localhost:8080`
> Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3️⃣ Mobile App - React Native (`DemoApp/`)

**a. Cài đặt dependencies:**

```bash
cd DemoApp
npm install
```

**b. Cấu hình IP Backend:**

Mở file `DemoApp/APIService.ts` và sửa IP thành IP máy tính của bạn:

```typescript
const API_URL = "http://YOUR_LOCAL_IP:8080/api";
const AI_URL = "http://YOUR_LOCAL_IP:5000";
```

> 💡 **Tìm IP**: Mở CMD → gõ `ipconfig` → lấy **IPv4 Address** (VD: `192.168.1.60`)

**c. Chạy App:**

```bash
npx expo start
```

- Quét QR code bằng app **Expo Go** trên điện thoại
- Hoặc nhấn `a` để mở Android Emulator
- Hoặc nhấn `i` để mở iOS Simulator

### 4️⃣ Admin Panel (`test-admin/`)

**a. Cài đặt:**

```bash
cd test-admin
npm install
```

**b. Chạy:**

```bash
npm run dev
```

> Admin Panel chạy tại: `http://localhost:5173`
> Đăng nhập bằng tài khoản Admin đã tạo trong database.

### 5️⃣ AI Server (`ServerAI/`)

**a. Cài đặt thư viện Python:**

```bash
cd ServerAI
pip install flask flask-cors google-genai pillow requests
```

**b. Cấu hình API Key:**

Mở file `ServerAI/main.py` và thay API Key:

```python
API_KEY = "YOUR_GEMINI_API_KEY"
```

> 🔑 Lấy API Key miễn phí tại: [Google AI Studio](https://aistudio.google.com/apikey)

**c. Cấu hình URL Backend:**

```python
JAVA_API_URL = "http://YOUR_LOCAL_IP:8080/api/public/products"
```

**d. Chạy AI Server:**

```bash
python main.py
```

> AI Server chạy tại: `http://localhost:5000`

---

## 📖 API Documentation

Backend cung cấp Swagger UI để test API trực tiếp:

```
http://localhost:8080/swagger-ui.html
```

### Các nhóm API chính:

| Nhóm       | Endpoint                                                                                      | Mô tả                           |
| ---------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| Auth       | `POST /api/login`                                                                             | Đăng nhập, nhận JWT Token       |
| Products   | `GET /api/public/products`                                                                    | Danh sách sản phẩm (phân trang) |
| Categories | `GET /api/public/categories`                                                                  | Danh sách danh mục              |
| Cart       | `POST /api/public/carts/{cartId}/products/{productId}/quantity/{qty}`                         | Thêm vào giỏ                    |
| Orders     | `POST /api/public/users/{email}/carts/{cartId}/addresses/{addressId}/payments/{method}/order` | Đặt hàng                        |
| Reviews    | `GET /api/public/products/{id}/reviews`                                                       | Xem đánh giá                    |
| Wishlist   | `POST /api/public/wishlist/{email}/toggle/{productId}`                                        | Toggle yêu thích                |
| Vouchers   | `GET /api/admin/vouchers`                                                                     | Quản lý voucher (Admin)         |
| Address    | `GET /api/public/users/{email}/addresses`                                                     | Quản lý địa chỉ                 |
| AI Chat    | `POST http://localhost:5000/chat`                                                             | Chat với AI                     |

### Tài khoản mặc định:

Khi chạy lần đầu, hãy đăng ký tài khoản mới qua API hoặc Mobile App. Để tạo tài khoản Admin, cập nhật role trong database:

```sql
-- Sau khi đăng ký user, gán role ADMIN
INSERT INTO user_role (user_id, role_id) VALUES (1, 101);
```

---

## 📸 Screenshots

<details>
<summary>📱 Mobile App</summary>

Ứng dụng bao gồm các màn hình:

- **Onboarding**: 3 bước giới thiệu app
- **Login / Register**: Đăng nhập / Đăng ký
- **Home**: Trang chủ với danh mục & sản phẩm nổi bật
- **Menu**: Danh sách sản phẩm với bộ lọc
- **Product Detail**: Chi tiết sản phẩm, đánh giá, thêm vào giỏ
- **Cart**: Giỏ hàng với chức năng chọn riêng
- **Payment**: Thanh toán với địa chỉ & voucher
- **Orders**: Lịch sử đơn hàng
- **Profile**: Thông tin cá nhân, địa chỉ, cài đặt
- **AI Chat**: Chat với AI để đặt món

</details>

<details>
<summary>🖥️ Admin Panel</summary>

- **Dashboard**: Tổng quan hệ thống
- **Products**: Quản lý sản phẩm (CRUD + ảnh)
- **Categories**: Quản lý danh mục
- **Orders**: Quản lý & cập nhật trạng thái đơn hàng
- **Users**: Quản lý người dùng
- **Vouchers**: Quản lý mã giảm giá

</details>

---

## 📁 Cấu trúc thư mục

```
react-native/
├── example05/                  # 🔧 Backend Spring Boot
│   ├── src/main/java/.../
│   │   ├── config/             # Security, Swagger, MoMo config
│   │   ├── controller/         # REST Controllers (11 files)
│   │   ├── entity/             # JPA Entities (13 files)
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── service/            # Business Logic (Service + Impl)
│   │   ├── security/           # JWT Filter & Util
│   │   ├── payloads/           # DTOs
│   │   └── exceptions/         # Custom Exception Handlers
│   └── src/main/resources/
│       └── application.properties
│
├── DemoApp/                    # 📱 Mobile App (React Native)
│   ├── app/
│   │   ├── (home)/             # Tab screens (Home, Menu, Profile...)
│   │   ├── auth/               # Login, Register, Forgot Password, OTP
│   │   ├── components/         # Reusable components
│   │   │   ├── cart/           # Cart screen & context
│   │   │   ├── chat/           # AI Chat screen
│   │   │   ├── order/          # Order list & detail
│   │   │   ├── payment/        # Payment & Order Success
│   │   │   ├── product/        # Product card & detail
│   │   │   └── profile/        # Profile, Address, Settings
│   │   ├── context/            # Theme, Language, Wishlist
│   │   └── onboarding/         # Onboarding steps
│   ├── APIService.ts           # Tất cả API calls
│   └── package.json
│
├── test-admin/                 # 🖥️ Admin Panel (React-Admin)
│   ├── src/
│   │   ├── component/
│   │   │   ├── category/       # Category CRUD
│   │   │   ├── product/        # Product CRUD
│   │   │   ├── order/          # Order management
│   │   │   ├── user/           # User management
│   │   │   ├── cart/           # Cart management
│   │   │   └── voucher/        # Voucher CRUD
│   │   ├── App.tsx             # Main app setup
│   │   ├── authProvider.ts     # JWT Auth for admin
│   │   └── dataProvider.ts     # Custom REST data provider
│   └── package.json
│
├── ServerAI/                   # 🤖 AI Chatbot Server
│   └── main.py                 # Flask + Gemini AI
│
└── images/                     # 🖼️ Product images (auto-generated)
```

---

## ⚙️ Biến môi trường cần cấu hình

| File                                   | Biến                            | Mô tả                                           |
| -------------------------------------- | ------------------------------- | ----------------------------------------------- |
| `example05/.../application.properties` | `spring.datasource.password`    | Mật khẩu MySQL                                  |
| `example05/.../application.properties` | `spring.mail.username/password` | Email & App Password Gmail                      |
| `example05/.../application.properties` | `jwt_secret`                    | Secret key cho JWT                              |
| `DemoApp/APIService.ts`                | `API_URL`                       | IP Backend (VD: `http://192.168.1.60:8080/api`) |
| `DemoApp/APIService.ts`                | `AI_URL`                        | IP AI Server (VD: `http://192.168.1.60:5000`)   |
| `ServerAI/main.py`                     | `API_KEY`                       | Google Gemini API Key                           |
| `ServerAI/main.py`                     | `JAVA_API_URL`                  | URL Backend API                                 |

---

## 🔐 Bảo mật

- Sử dụng **JWT Token** cho xác thực API
- **Spring Security** bảo vệ các endpoint admin
- **BCrypt** mã hóa mật khẩu
- **CORS** được cấu hình cho cross-origin requests
- **OTP qua Email** cho chức năng quên mật khẩu

---

## 📄 License

Dự án này được phát triển bởi **Nguyễn Trúc Trường** phục vụ mục đích học tập.

---

## 👨‍💻 Tác giả

**Nguyễn Trúc Trường**

- GitHub: [@nguyentructruong2308-beep](https://github.com/nguyentructruong2308-beep)
