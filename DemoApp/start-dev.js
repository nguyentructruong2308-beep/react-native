const { exec } = require('child_process');
const axios = require('axios');
const fs = require('fs');

// 1. Khởi động ngrok (thêm callback để kiểm tra nếu lệnh ngrok không tồn tại)
console.log('>> Đang khởi động ngrok tại port 8080...');
const ngrokProcess = exec('ngrok http 8080', (error) => {
    if (error) {
        console.error('>> Lỗi: Không thể chạy lệnh ngrok. Hãy chắc chắn bạn đã cài ngrok global (npm install -g ngrok) hoặc tải file ngrok.exe về máy.');
        process.exit(1);
    }
});

// 2. Đợi ngrok ổn định rồi lấy URL
setTimeout(async () => {
    try {
        const response = await axios.get('http://127.0.0.1:4040/api/tunnels');
        // Lấy URL có https (thường là phần tử đầu tiên)
        const publicUrl = response.data.tunnels[0].public_url;
        
        console.log(`>> URL ngrok: ${publicUrl}`);
        
        const content = `export const BASE_URL = "${publicUrl}/api";`;
        
        if (!fs.existsSync('./constants')) {
            fs.mkdirSync('./constants');
        }
        fs.writeFileSync('./constants/ApiConfig.js', content);
        
        console.log('>> Đã cập nhật ApiConfig.js thành công!');
        // Không gọi process.exit(0) ở đây vì cần giữ ngrok chạy ngầm
    } catch (error) {
        console.error('>> Lỗi: Không thể lấy URL từ ngrok API (127.0.0.1:4040).');
        console.error('>> Hãy thử chạy ngrok thủ công xem có lỗi gì không.');
        process.exit(1);
    }
}, 4000); // Tăng lên 4 giây cho chắc chắn