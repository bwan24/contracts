from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.file_utils import save_uploaded_file
from utils.document_converter import converter
import os

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

# 文件上传目录
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

# @router.post("/upload")
# async def upload_contract(file: UploadFile = File(...)):
#     """上传合同文件"""
#     try:
#         # 保存上传的文件
#         filename = await save_uploaded_file(file, UPLOAD_DIR)
        
#         # 返回文件信息
#         return {
#             "filename": filename,
#             "original_filename": file.filename,
#             "message": "File uploaded successfully"
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error uploading file: {str(e)}"
#         )

@router.post("/convert/word-to-md")
async def convert_word_to_markdown(file: UploadFile = File(...)):
    """将Word文档转换为Markdown格式"""
    try:
        # 检查文件类型
        if not file.filename.lower().endswith('.docx'):
            raise HTTPException(
                status_code=400,
                detail="Only .docx files are supported for Word to Markdown conversion"
            )
        
        # 保存上传的文件
        filename = await save_uploaded_file(file, UPLOAD_DIR)
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # 转换为Markdown
        markdown_content = converter.convert_docx_to_markdown(file_path)
        
        # 返回转换结果
        return {
            "original_filename": file.filename,
            "markdown_content": markdown_content,
            "message": "Word document successfully converted to Markdown"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error converting Word document to Markdown: {str(e)}"
        )

@router.post("/convert/pdf-to-md")
async def convert_pdf_to_markdown(file: UploadFile = File(...)):
    """将PDF文档转换为Markdown格式"""
    try:
        # 检查文件类型
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only .pdf files are supported for PDF to Markdown conversion"
            )
        
        # 保存上传的文件
        filename = await save_uploaded_file(file, UPLOAD_DIR)
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # 转换为Markdown
        markdown_content = converter.convert_pdf_to_markdown(file_path)
        
        # 返回转换结果
        return {
            "original_filename": file.filename,
            "markdown_content": markdown_content,
            "message": "PDF document successfully converted to Markdown"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error converting PDF document to Markdown: {str(e)}"
        )