import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 创建Prisma Client实例
const prisma = new PrismaClient();

// GET /api/contracts/[id] - 获取指定ID的合同详情
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
    
    // 使用Prisma Client获取合同信息
    const contract = await prisma.contract.findUnique({
      where: { id: id },
    });
    
    if (!contract) {
      return NextResponse.json(
        { success: false, message: '合同不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应，注意不直接返回fileContent（二进制数据），而是通过单独的文件URL访问
    // 确保保留markdown_content字段
    const contractData = {
      ...contract,
      fileContent: undefined, // 移除二进制数据，避免序列化问题
    };
    
    return NextResponse.json(
      {
        success: true,
        data: contractData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('获取合同详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取合同详情失败，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[id] - 删除指定ID的合同
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在Next.js 16中，params是一个Promise，必须使用await解包
    const resolvedParams = await params;
    const contractId = resolvedParams?.id;
    
    // 验证id
    if (!contractId || typeof contractId !== 'string' || contractId.trim() === '') {
      return NextResponse.json(
        { success: false, message: '缺少合同ID' },
        { status: 400 }
      );
    }
    
    // 尝试删除合同
    const deletedContract = await prisma.contract.delete({
      where: { id: contractId },
    });
    
    // 删除成功
    return NextResponse.json(
      {
        success: true,
        message: '合同删除成功',
        data: deletedContract,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('删除合同处理失败:', error);
    
    // 检查是否是记录不存在的错误（Prisma错误代码P2025）
    // 按照需求，删除不存在的合同时不阻拦报错，返回成功状态
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: true,
          message: '合同删除成功',
        },
        { status: 200 }
      );
    }
    
    // 返回其他错误响应
    return NextResponse.json(
      {
        success: false,
        message: '删除合同失败，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}