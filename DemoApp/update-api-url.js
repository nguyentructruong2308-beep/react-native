const axios = require('axios');
const fs = require('fs');

async function updateNgrokUrl() {
  try {
    // Gọi API của ngrok để lấy thông tin tunnel
    const response = await axios.get('http://127.0.0.1:4040/api/tunnels');
    const publicUrl = response.data.tunnels[0].public_url;

    console.log(`>> Đã tìm thấy URL ngrok mới: ${publicUrl}`);

    // Ghi vào file cấu hình (ví dụ constants/ApiConfig.js)
    const content = `export const BASE_URL = "${publicUrl}/api";`;
    fs.writeFileSync('./constants/ApiConfig.js', content);

    console.log('>> Đã cập nhật file ApiConfig.js thành công!');
  } catch (error) {
    console.error('>> Lỗi: Hãy đảm bảo ngrok đang chạy trước khi chạy script này!');
  }
}

updateNgrokUrl();