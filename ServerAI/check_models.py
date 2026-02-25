from google import genai

# Dán API Key của bạn vào đây
API_KEY = "AIzaSyA4C3hxMAPXQc21EhSRccYYxCZmNuYXJQA" 

client = genai.Client(api_key=API_KEY)

print("--- DANH SÁCH MODEL GOOGLE CHO PHÉP BẠN DÙNG ---")
try:
    for model in client.models.list():
        # Lọc ra các model hỗ trợ tạo nội dung (generateContent)
        if "generateContent" in model.supported_actions:
            # Bỏ tiền tố 'models/' để lấy tên ngắn gọn
            print(f"- {model.name.replace('models/', '')}")
            
except Exception as e:
    print(f"Lỗi: {e}")