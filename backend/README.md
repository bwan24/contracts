# Contract Analysis Backend

后端API服务，基于Python FastAPI框架开发，提供合同分析相关功能。

## 技术栈

- **Python 3.9+**
- **FastAPI** - 高性能的异步API框架
- **Pydantic** - 数据验证和设置管理
- **Uvicorn** - ASGI服务器

## 项目结构

```
backendwen/
├── api/
│   ├── routes/          # API路由
│   ├── services/        # 业务逻辑层
│   ├── models/          # 数据模型
│   └── schemas/         # 请求/响应模型
├── config/              # 配置管理
├── utils/               # 工具函数
├── main.py              # 应用入口
├── requirements.txt     # 依赖列表
├── .env                 # 环境变量
└── README.md            # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境（可选但推荐）
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

复制并配置环境变量文件：

```bash
# 已经创建了.env文件，可以根据需要修改配置
```

### 3. 启动服务

```bash
# 开发模式运行
python main.py

# 或者使用uvicorn直接运行
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后，可以访问以下地址：
- API文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

## API端点

### 合同相关

- `POST /api/contracts/upload` - 上传合同文件，支持PDF、DOCX、TXT格式
- `POST /api/contracts/convert/word-to-md` - 将Word文档转换为Markdown格式并返回
- `POST /api/contracts/convert/pdf-to-md` - 将PDF文档转换为Markdown格式并返回

## 实现功能

- 文件上传与验证
- 支持PDF、DOCX、TXT格式文件
- 文件安全验证（类型检查、文件名长度限制）
- 唯一文件名生成避免冲突
- Word文档转Markdown（支持格式保留、表格转换）
- PDF文档转Markdown（支持文本清理、格式优化）

## 开发说明

### 添加新功能

1. 在 `api/routes/` 中添加API端点
2. 在 `main.py` 中注册新路由
3. 根据需要在 `utils/` 中添加工具函数

### 运行测试

```bash
# 项目目前没有测试框架，后续可以添加
```

## 部署说明

在生产环境中，建议：
1. 使用Gunicorn作为WSGI服务器，配合Uvicorn工作进程
2. 设置正确的CORS配置，不要使用通配符
3. 使用环境变量管理敏感信息
4. 配置HTTPS

## 注意事项

- 文件上传功能支持PDF、DOCX、TXT格式，仅保存文件，尚未实现文件内容解析