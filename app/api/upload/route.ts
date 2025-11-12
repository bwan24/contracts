import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }
    
    // 检查文件类型
    const validExtensions = ['.docx', '.pdf'];
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: '仅支持 .docx 和 .pdf 文件' }, { status: 400 });
    }
    
    // 读取文件数据
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 确保public/contracts目录存在
    const contractsDir = path.join(process.cwd(), 'public', 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    // 生成唯一文件名（如果文件已存在，添加时间戳）
    let fileName = file.name;
    let filePath = path.join(contractsDir, fileName);
    
    if (fs.existsSync(filePath)) {
      const timestamp = Date.now();
      fileName = `${path.parse(file.name).name}_${timestamp}${fileExtension}`;
      filePath = path.join(contractsDir, fileName);
    }
    
    // 写入文件
    fs.writeFileSync(filePath, buffer);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      fileName: fileName,
      filePath: `/contracts/${fileName}`,
      fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`
    });
    
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '文件上传失败' 
    }, { status: 500 });
  }
}
