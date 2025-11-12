from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 导入配置和路由
from config.settings import settings
from api.routes import contract_routes

# 加载环境变量
load_dotenv()

# 创建FastAPI应用实例
app = FastAPI(
    title="Contract Analysis API",
    description="后端API服务，提供合同分析相关功能",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该设置具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(contract_routes.router)

# 根路径
@app.get("/")
def read_root():
    return {"message": "Contract Analysis API 服务正在运行"}

# 健康检查端点
@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level=settings.log_level.lower()
    )