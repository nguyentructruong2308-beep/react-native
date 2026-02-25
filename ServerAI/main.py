from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from PIL import Image
import requests
import io
import json

app = Flask(__name__)
CORS(app)

API_KEY = "YOUR_GEMINI_API_KEY"  # Lấy key tại: https://aistudio.google.com/apikey
# 🔥 SỬA: Dùng 1.5-flash chuẩn (2.5-flash không tồn tại)
MODEL_NAME = "gemini-2.5-flash" 

JAVA_API_URL = "http://localhost:8080/api/public/products"  # Đổi thành IP máy bạn nếu chạy trên điện thoại

client = genai.Client(api_key=API_KEY)

def get_restaurant_data():
    """Lấy dữ liệu tối giản để AI không bị quá tải thông tin"""
    try:
        # Giới hạn lấy 20 món mới nhất để dữ liệu truyền đi cực nhẹ
        response = requests.get(f"{JAVA_API_URL}?pageNumber=0&pageSize=20", timeout=3)
        if response.status_code == 200:
            data = response.json()
            items = data.get('content', []) if isinstance(data, dict) else data
            
            # CHỈ LẤY THÔNG TIN CẦN THIẾT CHO CARD
            minimal_menu = []
            for item in items:
                minimal_menu.append({
                    "id": item.get('productId'),
                    "n": item.get('productName'), # Rút ngắn key để tiết kiệm token
                    "p": item.get('specialPrice', item.get('price')),
                    "i": item.get('image')
                })
            return json.dumps(minimal_menu, ensure_ascii=False)
    except:
        return "[]"

@app.route("/chat", methods=["POST"])
def chat_gemini():
    user_message = request.form.get("message", "").strip()
    image_file = request.files.get("image")
    audio_file = request.files.get("audio")  # 🎤 Nhận Audio từ Client
    user_name = request.form.get("user_name", "Anh/Chị")

    # 🔍 DEBUG LOG
    print(f"📥 Received message from {user_name}: {user_message}")
    print(f"📥 Received image: {image_file}")
    print(f"📥 Received audio: {audio_file}")
    print(f"📥 Form data keys: {list(request.form.keys())}")
    print(f"📥 Files keys: {list(request.files.keys())}")

    if not user_message and not image_file and not audio_file:
        return jsonify({"status": "error", "message": "Rỗng"}), 400

    try:
        menu_json = get_restaurant_data()

        # SYSTEM PROMPT: Thiết lập nhân vật "Đệ anh Trường"
        system_instruction = f"""
Bạn là Đệ anh Trường, trợ lý ảo thân thiện của {user_name} tại nhà hàng. Menu: {menu_json}

CÁCH XỬ LÝ TIN NHẮN THOẠI:
- Hãy CỐ GẮNG HIỂU nội dung audio. Khách hàng đang nói tiếng Việt.
- Nếu nghe được bất kỳ từ khóa nào liên quan đến món ăn, đồ uống, hoặc menu → Hãy phản hồi theo đó.
- CHỈ hỏi lại "em chưa nghe rõ" nếu audio hoàn toàn IM LẶNG hoặc chỉ có tiếng ồn.

CÁCH PHẢN HỒI:
- Xưng "Em/Đệ", gọi khách là "{user_name}". Thân thiện, dùng emoji.
- Khách yêu cầu mua (thêm/lấy/cho/mua + tên món) → [ADD_TO_CART: {{"id": id, "name": "tên", "price": giá, "image": "ảnh", "q": số_lượng}}]
- Khách hỏi về món/menu/giá → Trả lời + [PRODUCT_CARD: {{"id": id, "name": "tên", "price": giá, "image": "ảnh"}}]
- Khách muốn thanh toán → [CHECKOUT_CARD]
- Khách chào hỏi/nói chuyện → Chào lại, hỏi muốn gọi món gì.
- Món không có → Tư vấn món tương tự trong menu.
"""

        contents = [system_instruction]
        if user_message: contents.append(f"Khách: {user_message}")
        if image_file:
            img = Image.open(image_file)
            img.thumbnail((800, 800))
            contents.append(img)
        
        # 🎤 Xử lý audio nếu có
        if audio_file:
            import tempfile
            import os
            
            # Debug: In thông tin file audio
            print(f"🎤 Audio filename: {audio_file.filename}")
            print(f"🎤 Audio content_type: {audio_file.content_type}")
            
            # Xác định đuôi file dựa trên tên hoặc content_type
            filename = audio_file.filename or "audio.m4a"
            if ".m4a" in filename or "m4a" in str(audio_file.content_type):
                suffix = ".m4a"
            elif ".wav" in filename:
                suffix = ".wav"
            elif ".webm" in filename or "webm" in str(audio_file.content_type):
                suffix = ".webm"
            else:
                suffix = ".m4a"  # Mặc định
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                audio_file.save(tmp.name)
                tmp_path = tmp.name
            
            # Debug: In kích thước file
            file_size = os.path.getsize(tmp_path)
            print(f"🎤 Audio file size: {file_size} bytes")
            
            if file_size < 1000:
                print("⚠️ Audio file too small, might be empty!")
                contents.append("Khách gửi tin nhắn thoại nhưng file quá ngắn hoặc rỗng. Hãy hỏi lại.")
            else:
                # Upload file cho Gemini dùng genai.Client
                audio_upload = client.files.upload(file=tmp_path)
                print(f"🎤 Audio uploaded: {audio_upload}")
                contents.append(audio_upload)
                contents.append("Đây là tin nhắn thoại từ khách. Hãy lắng nghe KỸ và trả lời theo yêu cầu của họ.")
            
            os.remove(tmp_path)

        response = client.models.generate_content(model=MODEL_NAME, contents=contents)

        return jsonify({
            "status": "success",
            "reply": response.text
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)