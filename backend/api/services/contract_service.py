from typing import List, Optional
from datetime import datetime
from api.schemas.contract import ContractCreate, ContractResponse, ContractAnalysis, PotentialIssue

class ContractService:
    """合同服务层，处理业务逻辑"""
    
    def __init__(self):
        # 在实际应用中，这里会注入数据库连接
        self.contracts = []
        self.next_id = 1
    
    def create_contract(self, contract_data: ContractCreate) -> ContractResponse:
        """创建新合同"""
        contract = ContractResponse(
            id=self.next_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **contract_data.model_dump()
        )
        self.contracts.append(contract)
        self.next_id += 1
        return contract
    
    def get_contract_by_id(self, contract_id: int) -> Optional[ContractResponse]:
        """根据ID获取合同"""
        return next((c for c in self.contracts if c.id == contract_id), None)
    
    def list_contracts(self, skip: int = 0, limit: int = 10) -> List[ContractResponse]:
        """获取合同列表"""
        return self.contracts[skip : skip + limit]
    
    def analyze_contract(self, contract_id: int) -> ContractAnalysis:
        """分析合同内容"""
        contract = self.get_contract_by_id(contract_id)
        if not contract:
            raise ValueError(f"Contract with id {contract_id} not found")
        
        # 在实际应用中，这里会调用NLP或其他分析工具进行合同分析
        # 这里返回模拟的分析结果
        potential_issues = []
        
        # 模拟检查是否有明确的违约责任条款
        if "违约" not in (contract.description or "").lower():
            potential_issues.append(PotentialIssue(
                clause_number=None,
                clause_text="未找到明确的违约责任条款",
                issue_type="missing_clause",
                severity="medium",
                description="建议添加明确的违约责任条款，包括违约赔偿标准和方式"
            ))
        
        # 根据潜在问题数量确定风险等级
        risk_level = "low"
        if len(potential_issues) >= 3:
            risk_level = "high"
        elif len(potential_issues) >= 1:
            risk_level = "medium"
        
        suggestions = ["合同内容完整，请确认签署日期"]
        if potential_issues:
            suggestions.extend([issue.description for issue in potential_issues])
        
        return ContractAnalysis(
            contract_id=contract_id,
            risk_level=risk_level,
            clauses_analyzed=10,  # 模拟值
            potential_issues=potential_issues,
            suggestions=suggestions
        )

# 创建服务实例
contract_service = ContractService()