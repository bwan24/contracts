import { NextResponse } from 'next/server';

// GET /api/contracts - 返回mock合同数据
export async function GET() {
  try {
    // Mock数据
    const mockContracts = [
      {
        id: '1',
        title: '测试合同1',
        content: '这是第一份测试合同内容',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '测试合同2',
        content: '这是第二份测试合同内容',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天
      },
    ];

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        data: mockContracts,
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