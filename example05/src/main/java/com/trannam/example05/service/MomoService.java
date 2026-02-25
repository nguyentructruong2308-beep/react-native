package com.trannam.example05.service;

import com.trannam.example05.config.MomoConfig;
import com.trannam.example05.utils.MomoSecurity;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoService {

    // 🔥 ĐÃ SỬA: Bỏ tham số targetUrl để ép buộc dùng REDIRECT_URL từ Config (Ngrok)
    public Map<String, Object> createPayment(String orderId, String amount, String orderInfo) {
        try {
            String requestId = UUID.randomUUID().toString();
            String requestType = "captureWallet";
            String extraData = ""; 

            // 🔥 QUAN TRỌNG: Luôn dùng link Ngrok để MoMo redirect về Server trước
            // Sau đó Server mới đẩy về Localhost 8081
            String redirectUrl = MomoConfig.REDIRECT_URL; 
            String ipnUrl = MomoConfig.IPN_URL;

            // 1. TẠO CHỮ KÝ (SIGNATURE)
            String rawSignature = "accessKey=" + MomoConfig.ACCESS_KEY
                    + "&amount=" + amount
                    + "&extraData=" + extraData
                    + "&ipnUrl=" + ipnUrl
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + MomoConfig.PARTNER_CODE
                    + "&redirectUrl=" + redirectUrl
                    + "&requestId=" + requestId
                    + "&requestType=" + requestType;

            String signature = MomoSecurity.hmacSHA256(rawSignature, MomoConfig.SECRET_KEY);

            // 2. TẠO BODY JSON
            Map<String, Object> map = new HashMap<>();
            map.put("partnerCode", MomoConfig.PARTNER_CODE);
            map.put("requestId", requestId);
            map.put("amount", amount);
            map.put("orderId", orderId);
            map.put("orderInfo", orderInfo);
            map.put("redirectUrl", redirectUrl);
            map.put("ipnUrl", ipnUrl);
            map.put("lang", "vi");
            map.put("extraData", extraData);
            map.put("requestType", requestType);
            map.put("signature", signature);

            // 3. GỬI REQUEST VÀ LOG KẾT QUẢ
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(map, headers);

            // Log để kiểm tra link redirect
            System.out.println(">> Đang gửi request sang MoMo...");
            System.out.println("   - Order ID: " + orderId);
            System.out.println("   - IPN URL (Ngrok): " + ipnUrl);
            System.out.println("   - Redirect URL (Ngrok): " + redirectUrl);

            ResponseEntity<Map> response = restTemplate.postForEntity(MomoConfig.API_ENDPOINT, request, Map.class);

            // LOG phản hồi từ MoMo
            System.out.println(">> MoMo Response Body: " + response.getBody());

            return response.getBody();

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Lỗi từ phía MoMo (ví dụ: chữ ký sai, tiền tệ sai...)
            System.err.println(">> Lỗi HTTP MoMo: " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            // Lỗi hệ thống (mất mạng, code lỗi...)
            System.err.println(">> Lỗi hệ thống khi gọi MoMo: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}