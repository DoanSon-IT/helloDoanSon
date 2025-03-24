package com.sondv.phone.service;

import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MomoService {

    @Value("${momo.partnerCode}")
    private String partnerCode;

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @Value("${momo.requestUrl}")
    private String requestUrl;

    @Value("${momo.returnUrl}")
    private String returnUrl;

    @Value("${momo.notifyUrl}")
    private String notifyUrl;

    public String createMomoPayment(Long orderId, Double amount) {
        try {
            String requestId = UUID.randomUUID().toString();
            String orderInfo = "Thanh toán đơn hàng " + orderId;
            String extraData = "";

            Map<String, Object> momoRequest = new HashMap<>();
            momoRequest.put("partnerCode", partnerCode);
            momoRequest.put("accessKey", accessKey);
            momoRequest.put("requestId", requestId);
            momoRequest.put("amount", amount);
            momoRequest.put("orderId", orderId);
            momoRequest.put("orderInfo", orderInfo);
            momoRequest.put("returnUrl", returnUrl);
            momoRequest.put("notifyUrl", notifyUrl);
            momoRequest.put("extraData", extraData);
            momoRequest.put("requestType", "captureWallet");

            // ✅ Tạo chữ ký (signature)
            String rawData = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&requestId=" + requestId +
                    "&requestType=captureWallet";

            String signature = hmacSHA256(rawData, secretKey);
            momoRequest.put("signature", signature);

            // ✅ Gửi yêu cầu HTTP đến Momo
            Gson gson = new Gson();
            String jsonRequest = gson.toJson(momoRequest);

            URL url = new URL(requestUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);
            connection.getOutputStream().write(jsonRequest.getBytes(StandardCharsets.UTF_8));

            // ✅ Nhận phản hồi từ Momo
            Scanner scanner = new Scanner(connection.getInputStream(), StandardCharsets.UTF_8);
            String jsonResponse = scanner.useDelimiter("\\A").next();
            scanner.close();

            Map<String, String> responseMap = gson.fromJson(jsonResponse, HashMap.class);
            return responseMap.get("payUrl"); // ✅ Trả về link thanh toán

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo URL thanh toán Momo", e);
        }
    }

    // ✅ Hàm tạo chữ ký HMAC SHA256
    private String hmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hmacBytes);
    }
}
