import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// 后端转换API的基础URL
const BACKEND_API_BASE_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8000';

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public', 'contracts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // 解析multipart/form-data
    const formData = await request.formData();
    
    // 支持批量上传
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string;
    const standard = formData.get('standard') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: '请选择文件' },
        { status: 400 }
      );
    }
    debugger
    
    if (!type || !standard) {
      return NextResponse.json(
        { success: false, message: '请选择合同类型和标准' },
        { status: 400 }
      );
    }
    
    const results = [];
    
    for (const file of files) {
      // 验证文件类型
      const validExtensions = ['.docx', '.pdf'];
      const fileExtension = path.extname(file.name).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { success: false, message: `文件类型不支持: ${file.name}` },
          { status: 400 }
        );
      }
      
      // 读取文件内容
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // 生成唯一文件名
      let fileName = file.name;
      let filePath = path.join(uploadDir, fileName);
      
      if (fs.existsSync(filePath)) {
        const timestamp = Date.now();
        fileName = `${path.parse(file.name).name}_${timestamp}${fileExtension}`;
        filePath = path.join(uploadDir, fileName);
      }
      
      // 保存到文件系统
      fs.writeFileSync(filePath, buffer);
      debugger
      // 生成随机风险数据
      const riskCount = {
        high: Math.floor(Math.random() * 3),
        medium: Math.floor(Math.random() * 5) + 1,
        low: Math.floor(Math.random() * 4) + 1,
      };
      
      // 调用后端转换接口将文件转换为Markdown
      let markdownContent = null;
      try {
        const formDataForConvert = new FormData();
        formDataForConvert.append('file', file);
        
        // 根据文件类型选择不同的转换接口
        const convertEndpoint = fileExtension === '.pdf' 
          ? '/api/contracts/convert/pdf-to-md' 
          : '/api/contracts/convert/word-to-md';
          
        const convertResponse = await fetch(`${BACKEND_API_BASE_URL}${convertEndpoint}`, {
          method: 'POST',
          body: formDataForConvert,
        });
        
        if (!convertResponse.ok) {
          console.warn(`文件转换失败: ${file.name}`, await convertResponse.text());
        } else {
          const convertData = await convertResponse.json();
          markdownContent = convertData.markdown_content || null;
          console.warn(`文件转换成功: ${file.name}`, markdownContent);
        }
      } catch (convertError) {
        console.error(`转换文件时出错: ${file.name}`, convertError);
        // 转换失败不影响上传，继续保存文件
      }
      
      // 保存到数据库，包括文件内容和Markdown内容
      const contract = await prisma.contract.create({
        data: {
          name: file.name,
          type,
          standard,
          uploadDate: new Date(),
          fileUrl: `/contracts/${fileName}`,
          fileSize: formatFileSize(file.size),
          status: 'completed',
          riskCount,
          fileContent: buffer,
          fileType: file.type || `application/${fileExtension.replace('.', '')}`,
          markdown_content: markdownContent,
        },
      });
      
      results.push(contract);
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      message: `成功上传 ${files.length} 个合同`,
    }, { status: 200 });
    
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '文件上传失败',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}