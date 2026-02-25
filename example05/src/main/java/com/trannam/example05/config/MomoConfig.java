package com.trannam.example05.config;

public class MomoConfig {
    public static final String PARTNER_CODE = "MOMO"; 
    public static final String ACCESS_KEY = "F8BBA842ECF85";
    public static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    public static final String API_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    
    // 🔥 LƯU Ý: Thay cái domain này bằng domain Ngrok mới mỗi khi chạy lại ngrok
    public static final String NGROK_DOMAIN = "https://incompatibly-partakable-ileana.ngrok-free.dev";

    // 1. IPN: MoMo gọi ngầm vào đây để báo thành công (Quan trọng nhất)
    public static final String IPN_URL = NGROK_DOMAIN + "/api/public/payment/momo-ipn";
    
    // 2. REDIRECT: MoMo trả người dùng về đây -> Server hứng rồi đẩy về Localhost:8081
    public static final String REDIRECT_URL = NGROK_DOMAIN + "/api/public/payment/momo-return"; 
}