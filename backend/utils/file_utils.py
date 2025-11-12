import os
from typing import Optional
import uuid
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile) -> None:
    """验证上传的文件"""
    # 检查文件类型
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 检查文件名长度
    if len(file.filename) > 255:
        raise HTTPException(
            status_code=400,
            detail="File name too long"
        )

def generate_unique_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    file_ext = os.path.splitext(original_filename)[1]
    unique_id = uuid.uuid4().hex[:8]
    timestamp = uuid.uuid4().time_low
    return f"{unique_id}_{timestamp}{file_ext}"

async def save_uploaded_file(file: UploadFile, upload_dir: str) -> str:
    """保存上传的文件"""
    # 验证文件
    validate_file(file)
    
    # 确保上传目录存在
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成唯一文件名
    filename = generate_unique_filename(file.filename)
    file_path = os.path.join(upload_dir, filename)
    
    # 保存文件
    try:
        content = await file.read()
        
        # 检查文件大小
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size allowed: {MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # 重置文件指针
        await file.seek(0)
        
        return filename
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )