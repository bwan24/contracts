"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PaymentRatioInformationProps {
  // 可以添加实际需要的props
}

interface PaymentItem {
  name: string
  ratio: string
  timeRequirement: string
  calculationMethod: string
  comment: string
}

export default function PaymentRatioInformation({}: PaymentRatioInformationProps) {
  // Mock数据
  const paymentItems: PaymentItem[] = [
    {
      name: "预付款",
      ratio: "35%",
      timeRequirement: "合同签订后7日内",
      calculationMethod: "",
      comment: ""
    },
    {
      name: "进度款",
      ratio: "30%",
      timeRequirement: "设备到货后15日内",
      calculationMethod: "按批次",
      comment: ""
    },
    {
      name: "验收款",
      ratio: "30%",
      timeRequirement: "（每批（不超过四台）合同设备安装调试并通过 240 小时试运行后，买方收到卖方提交的预验收款的财务收据且核对无误后 15 日内）",
      calculationMethod: "按批次",
      comment: ""
    },
    {
      name: "质保金",
      ratio: "5%",
      timeRequirement: "质保期满后30日内",
      calculationMethod: "（合同总金额）× 5%",
      comment: ""
    }
  ]

  const scrollToSection = (location: string) => {
    console.log("[v0] Scrolling to:", location)
    // 实际滚动逻辑可以在这里实现
  }

  return (
    <Card className="p-4 sm:p-5 rounded-lg border border-border/40 shadow-sm bg-card/90 backdrop-blur-sm">
      <div className="mb-2 sm:mb-5 flex items-center justify-between pb-2 border-b border-border/20">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">付款比例信息</h2>
      </div>
      
      <div className="overflow-x-auto mt-3 -mx-1 sm:-mx-2">
        <div className="min-w-[640px] rounded-lg border border-border/40 overflow-hidden">
          <Table className="w-full text-xs sm:text-sm">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-sm text-primary">付款节点</TableHead>
                <TableHead className="font-semibold text-sm text-primary">比例</TableHead>
                <TableHead className="font-semibold text-sm text-primary">付款时间规定</TableHead>
                <TableHead className="font-semibold text-sm text-primary">付款批次</TableHead>
                <TableHead className="font-semibold text-sm text-primary">说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentItems.map((item, index) => (
                <TableRow key={index} className="group hover:bg-muted/20 transition-colors duration-150 border-b border-border/10 last:border-b-0">
                  <TableCell className="font-medium py-3 px-4">{item.name}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                      {item.ratio}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-normal max-w-md py-3 px-4">{item.timeRequirement}</TableCell>
                  <TableCell className="py-3 px-4">{item.calculationMethod || '-'}</TableCell>
                  <TableCell className="py-3 px-4">{item.comment || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}
