import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 创建Prisma Client实例
const prisma = new PrismaClient();

// GET /api/contracts - 从数据库查询所有合同数据
export async function GET() {
  try {
    // 从数据库查询所有合同
    const contracts = await prisma.contract.findMany();
    
    // 如果数据库中没有数据，返回一些默认数据
    // const responseData = contracts.length > 0 ? contracts : [
    //   {
    //     id: "1",
    //     name: "海上风电3.5MW机组采购合同",
    //     type: "wind-turbine",
    //     standard: "standard",
    //     uploadDate: new Date("2025-10-13T15:52:07"),
    //     fileUrl: "/contracts/contract-001.pdf",
    //     fileSize: "2.9 MB",
    //     status: "completed",
    //     riskCount: { high: 2, medium: 5, low: 3 },
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   }
    // ];

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        data: contracts,
        message: '合同数据获取成功',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('获取合同数据失败:', error);
    
    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        message: '获取合同数据失败，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}