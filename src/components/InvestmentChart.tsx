import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '@/types/investment';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InvestmentChartProps {
  data: ChartDataPoint[];
  onPointClick: (journalId: string) => void;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}

export const InvestmentChart = ({ data, onPointClick }: InvestmentChartProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd', { locale: ko });
  };

  const formatCurrency = (value: number) => {
    return `${(value / 10000).toFixed(0)}만원`;
  };

  const CustomDot = ({ cx, cy, payload }: CustomDotProps) => {
    if (payload?.hasJournal && cx && cy) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth={2}
          className="cursor-pointer hover:r-8 transition-all"
          onClick={() => payload.journalId && onPointClick(payload.journalId)}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">자산 변화 추이</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip 
            labelFormatter={(value) => format(new Date(value), 'yyyy년 MM월 dd일', { locale: ko })}
            formatter={(value: number) => [formatCurrency(value), '총 자산']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="totalAssets" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 8, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 mt-2">
        💡 빨간 점을 클릭하면 해당 시점의 투자일지를 볼 수 있습니다.
      </p>
    </div>
  );
};