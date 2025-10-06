import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvestmentJournal } from '@/types/investment';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface PortfolioChartProps {
  journals: InvestmentJournal[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function PortfolioChart({ journals }: PortfolioChartProps) {
  const portfolioData = useMemo(() => {
    if (!journals || journals.length === 0) {
      return {
        assetDistribution: [],
        performanceData: [],
        monthlyInvestment: [],
        totalInvestment: 0,
        totalValue: 0,
        totalReturn: 0,
        returnRate: 0,
        timeSeriesData: []
      };
    }

    // 시간별 총 자산 추이 데이터 생성
    const timeSeriesData = journals
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(journal => ({
        date: journal.date,
        totalAssets: journal.totalAssets || 0,
        evaluation: journal.evaluation || journal.totalAssets || 0
      }));

    // 자산별 분포 계산 (최신 일지 기준)
    const latestJournal = journals.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );

    const assetMap = new Map<string, { investment: number, currentValue: number, count: number }>();
    
    // 해외주식 처리
    if (latestJournal.foreignStocks && Array.isArray(latestJournal.foreignStocks)) {
      latestJournal.foreignStocks.forEach(stock => {
        if (stock && stock.symbol && typeof stock.quantity === 'number' && typeof stock.price === 'number') {
          const key = `해외주식-${stock.symbol}`;
          const investment = stock.quantity * stock.price;
          const currentValue = stock.currentPrice ? stock.quantity * stock.currentPrice : investment;
          
          assetMap.set(key, {
            investment,
            currentValue,
            count: 1
          });
        }
      });
    }

    // 국내주식 처리
    if (latestJournal.domesticStocks && Array.isArray(latestJournal.domesticStocks)) {
      latestJournal.domesticStocks.forEach(stock => {
        if (stock && stock.symbol && typeof stock.quantity === 'number' && typeof stock.price === 'number') {
          const key = `국내주식-${stock.symbol}`;
          const investment = stock.quantity * stock.price;
          const currentValue = stock.currentPrice ? stock.quantity * stock.currentPrice : investment;
          
          assetMap.set(key, {
            investment,
            currentValue,
            count: 1
          });
        }
      });
    }

    // 암호화폐 처리
    if (latestJournal.cryptocurrency && Array.isArray(latestJournal.cryptocurrency)) {
      latestJournal.cryptocurrency.forEach(crypto => {
        if (crypto && crypto.symbol && typeof crypto.quantity === 'number' && typeof crypto.price === 'number') {
          const key = `암호화폐-${crypto.symbol}`;
          const investment = crypto.quantity * crypto.price;
          const currentValue = crypto.currentPrice ? crypto.quantity * crypto.currentPrice : investment;
          
          assetMap.set(key, {
            investment,
            currentValue,
            count: 1
          });
        }
      });
    }

    // 현금 처리
    if (latestJournal.cash) {
      if (latestJournal.cash.krw > 0) {
        assetMap.set('현금-KRW', {
          investment: latestJournal.cash.krw,
          currentValue: latestJournal.cash.krw,
          count: 1
        });
      }
      if (latestJournal.cash.usd > 0) {
        const usdValue = latestJournal.cash.usd * 1320; // 임시 환율
        assetMap.set('현금-USD', {
          investment: usdValue,
          currentValue: usdValue,
          count: 1
        });
      }
    }

    const assetDistribution = Array.from(assetMap.entries()).map(([name, data]) => ({
      name: name,
      value: data.currentValue,
      investment: data.investment,
      return: data.currentValue - data.investment,
      returnRate: data.investment > 0 ? ((data.currentValue - data.investment) / data.investment * 100) : 0,
      count: data.count
    })).sort((a, b) => b.value - a.value);

    // 월별 투자 데이터
    const monthlyMap = new Map<string, number>();
    journals.forEach(journal => {
      if (journal.date && journal.totalAssets) {
        const month = journal.date.substring(0, 7); // YYYY-MM
        const monthlyInvestment = journal.totalAssets;
        
        monthlyMap.set(month, Math.max(monthlyMap.get(month) || 0, monthlyInvestment));
      }
    });

    const monthlyInvestment = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 전체 통계
    const totalInvestment = assetDistribution.reduce((sum, item) => sum + item.investment, 0);
    const totalValue = assetDistribution.reduce((sum, item) => sum + item.value, 0);
    const totalReturn = totalValue - totalInvestment;
    const returnRate = totalInvestment > 0 ? (totalReturn / totalInvestment * 100) : 0;

    // 성과 데이터
    const performanceData = assetDistribution.map(item => ({
      name: item.name,
      투자금액: item.investment,
      현재가치: item.value,
      수익률: item.returnRate
    }));

    return {
      assetDistribution,
      performanceData,
      monthlyInvestment,
      totalInvestment,
      totalValue,
      totalReturn,
      returnRate,
      timeSeriesData
    };
  }, [journals]);

  if (!journals || journals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>포트폴리오 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            투자일지를 작성하면 포트폴리오 분석을 확인할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { assetDistribution, performanceData, monthlyInvestment, totalInvestment, totalValue, totalReturn, returnRate, timeSeriesData } = portfolioData;

  return (
    <div className="space-y-6">
      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">총 투자금액</div>
            <div className="text-2xl font-bold">
              {totalInvestment.toLocaleString()}원
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">현재 가치</div>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString()}원
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">총 수익</div>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toLocaleString()}원
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">수익률</div>
            <div className={`text-2xl font-bold ${returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {returnRate >= 0 ? '+' : ''}{returnRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 총 자산 추이 차트 */}
      {timeSeriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>총 자산 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만원`} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()}원`, '총자산']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalAssets" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="총 자산"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 자산 분포 차트 */}
      {assetDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>자산 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()}원`, '현재가치']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 자산별 성과 */}
      {assetDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>자산별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assetDistribution.map((asset, index) => (
                <div key={asset.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        투자: {asset.investment.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {asset.value.toLocaleString()}원
                    </div>
                    <div className={`text-sm ${asset.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.returnRate >= 0 ? '+' : ''}{asset.returnRate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 월별 투자 추이 */}
      {monthlyInvestment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>월별 투자 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyInvestment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만원`} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()}원`, '투자금액']} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}