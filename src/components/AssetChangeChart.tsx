import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

function AssetChangeChart() {
  const [period, setPeriod] = useState('3m');
  const [compareIndex, setCompareIndex] = useState<string | null>(null);
  const [indexData, setIndexData] = useState<any[]>([]);

  const { data: journals, isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('investment_journals')
        .select('*')
        .eq('user_id', user.id)
        .order('date');
      
      if (error) throw error;
      return data || [];
    },
  });

  // 기간별 필터링
  const filteredJournals = journals?.filter(j => {
    const date = new Date(j.date);
    const now = new Date();
    let months;
    switch (period) {
      case '3m': months = 3; break;
      case '6m': months = 6; break;
      case '1y': months = 12; break;
      case '3y': months = 36; break;
      default: return true;
    }
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    return date >= cutoffDate;
  }) || [];

  // 지수 데이터 fetch
  useEffect(() => {
    if (compareIndex && alphaVantageKey) {
      const symbol = compareIndex === 'sp500' ? 'SPY' : 'QQQ'; // ETF 사용
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${alphaVantageKey}`;
      
      axios.get(url)
        .then(res => {
          const timeSeries = res.data['Time Series (Daily)'];
          if (timeSeries) {
            const parsed = Object.keys(timeSeries)
              .slice(0, 100) // 최근 100일
              .map(date => ({ 
                date, 
                value: parseFloat(timeSeries[date]['4. close']) 
              }))
              .reverse(); // 날짜 순서 정렬
            
            // 정규화 (첫 번째 값을 100으로)
            const base = parsed[0]?.value || 1;
            const normalized = parsed.map(d => ({ 
              ...d, 
              value: (d.value / base) * 100 
            }));
            
            setIndexData(normalized);
          }
        })
        .catch(err => {
          console.error('Index fetch error:', err);
          setIndexData([]);
        });
    } else {
      setIndexData([]);
    }
  }, [compareIndex, period, alphaVantageKey]);

  // 사용자 데이터 정규화
  const userData = filteredJournals.map(j => ({ 
    date: j.date, 
    value: j.total_assets || 0 
  }));
  
  const baseUser = userData[0]?.value || 1;
  const normalizedUser = userData.map(d => ({ 
    ...d, 
    value: baseUser > 0 ? (d.value / baseUser) * 100 : 0 
  }));

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="text-white text-center">차트 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-white">자산 변화 추이</h2>
      
      {/* 기간 선택 버튼 */}
      <div className="flex gap-2 mb-4">
        {['3m', '6m', '1y', '3y'].map(p => (
          <button 
            key={p}
            onClick={() => setPeriod(p)} 
            className={`px-4 py-2 rounded transition-colors ${
              period === p 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {p === '3m' ? '3개월' : p === '6m' ? '6개월' : p === '1y' ? '1년' : '3년'}
          </button>
        ))}
      </div>
      
      {/* 지수 비교 버튼 */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setCompareIndex(compareIndex === 'sp500' ? null : 'sp500')} 
          className={`px-4 py-2 rounded transition-colors ${
            compareIndex === 'sp500' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          S&P500 비교
        </button>
        <button 
          onClick={() => setCompareIndex(compareIndex === 'nasdaq' ? null : 'nasdaq')} 
          className={`px-4 py-2 rounded transition-colors ${
            compareIndex === 'nasdaq' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Nasdaq 비교
        </button>
      </div>

      {/* 차트 */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedUser}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, '내 자산']}
              labelFormatter={(label) => `날짜: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="내 자산"
            />
            {indexData.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name={compareIndex?.toUpperCase()}
                data={indexData}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {normalizedUser.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>투자일지 데이터가 없습니다.</p>
          <p>일지를 작성하면 자산 변화 추이를 확인할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}

export default AssetChangeChart;