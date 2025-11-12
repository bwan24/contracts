from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置设置"""
    # API配置
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_env: str = "development"
    
    # 数据库配置（如果需要）
    # database_url: str = "sqlite:///./contracts.db"
    
    # 日志配置
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# 创建全局配置实例
settings = Settings()