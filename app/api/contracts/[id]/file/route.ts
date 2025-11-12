import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 创建Prisma Client实例
const prisma = new PrismaClient();

// GET /api/contracts/[id]/file - 获取合同文件的二进制内容
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在Next.js 16中，params是一个Promise，必须使用await解包
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    
    // 验证id
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { success: false, message: '缺少合同ID' },
        { status: 400 }
      );
    }
    
    // 使用Prisma Client获取合同信息，包括fileContent
    const contract = await prisma.contract.findUnique({
      where: { id: id },
      select: {
        fileContent: true,
        fileType: true,
        name: true,
      },
    });
    
    if (!contract) {
      return NextResponse.json(
        { success: false, message: '合同不存在' },
        { status: 404 }
      );
    }
    
    if (!contract.fileContent) {
      return NextResponse.json(
        { success: false, message: '合同文件内容不存在' },
        { status: 404 }
      );
    }
    
    // 将Buffer转换为ArrayBuffer
    const arrayBuffer = contract.fileContent.buffer;
    
    // 创建响应
    const response = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contract.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(contract.name)}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
    
    return response;
  } catch (error: any) {
    console.error('获取合同文件内容失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取合同文件内容失败，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}