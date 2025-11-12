from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ContractBase(BaseModel):
    """合同基础模型"""
    title: str = Field(..., description="合同标题", max_length=200)
    description: Optional[str] = Field(None, description="合同描述")
    parties: List[str] = Field(..., description="合同参与方列表")
    effective_date: Optional[datetime] = Field(None, description="合同生效日期")
    expiration_date: Optional[datetime] = Field(None, description="合同到期日期")
    file_path: Optional[str] = Field(None, description="合同文件路径")

class ContractCreate(ContractBase):
    """创建合同的请求模型"""
    pass

class ContractResponse(ContractBase):
    """合同响应模型"""
    id: int = Field(..., description="合同ID")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="更新时间")
    
    class Config:
        from_attributes = True

class PotentialIssue(BaseModel):
    """潜在问题模型"""
    clause_number: Optional[int] = Field(None, description="条款编号")
    clause_text: str = Field(..., description="条款内容")
    issue_type: str = Field(..., description="问题类型")
    severity: str = Field(..., description="严重程度", pattern="^(critical|high|medium|low)$")
    description: str = Field(..., description="问题描述")

class ContractAnalysis(BaseModel):
    """合同分析结果模型"""
    contract_id: int = Field(..., description="合同ID")
    risk_level: str = Field(..., description="风险等级", pattern="^(high|medium|low)$")
    clauses_analyzed: int = Field(..., description="已分析条款数量")
    potential_issues: List[PotentialIssue] = Field(default_factory=list, description="潜在问题列表")
    suggestions: List[str] = Field(default_factory=list, description="建议列表")
    analysis_date: datetime = Field(default_factory=datetime.utcnow, description="分析时间")