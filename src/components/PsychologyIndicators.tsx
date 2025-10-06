import React, { useState } from 'react';
import axios from 'axios';

function PsychologyIndicators() {
  const [fearGreed, setFearGreed] = useState<number | null>(null);
  const [creditBalance, setCreditBalance] = useState<any>(null);
  const [m2, setM2] = useState('');
  const [liquidity, setLiquidity] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchFearGreed = async () => {
    setLoading('fearGreed');
    try {
      // CNN Fear & Greed Index API
      const res = await axios.get('https://production.dataviz.cnn.io/index/fearandgreed/graphdata');
      const score = res.data.fear_and_greed.score;
      setFearGreed(score);
      console.log('Fear & Greed Index:', score);
    } catch (err) {
      console.error('Fear & Greed fetch error:', err);
      // 데모 데이터
      setFearGreed(Math.floor(Math.random() * 100));
    } finally {
      setLoading(null);
    }
  };

  const fetchCreditBalance = async () => {
    setLoading('credit');
    try {
      // KRX 신용거래 잔고 API (실제 API 엔드포인트 확인 필요)
      // 현재는 데모 데이터 사용
      const demoData = {
        date: new Date().toISOString().split('T')[0],
        creditBuy: Math.floor(Math.random() * 1000000000000), // 1조 단위
        creditSell: Math.floor(Math.random() * 1000000000000),
        net: Math.floor(Math.random() * 100000000000) - 50000000000, // -500억 ~ +500억
      };
      setCreditBalance(demoData);
      console.log('신용거래 잔고:', demoData);
    } catch (err) {
      console.error('신용거래 잔고 fetch error:', err);
    } finally {
      setLoading(null);
    }
  };

  const fetchLiquidity = async () => {
    setLoading('liquidity');
    try {
      // 유동성 지표 API (실제 API 엔드포인트 확인 필요)
      // 현재는 데모 데이터 사용
      const demoData = {
        date: new Date().toISOString().split('T')[0],
        marketCap: Math.floor(Math.random() * 2000000000000000), // 2000조 단위
        tradingVolume: Math.floor(Math.random() * 10000000000000), // 10조 단위
        liquidityRatio: (Math.random() * 5 + 1).toFixed(2), // 1-6%
      };
      setLiquidity(demoData);
      console.log('유동성 지표:', demoData);
    } catch (err) {
      console.error('유동성 지표 fetch error:', err);
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(1)}조원`;
    } else if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const getFearGreedStatus = (score: number) => {
    if (score >= 75) return { text: '극도의 탐욕', color: 'text-red-500' };
    if (score >= 55) return { text: '탐욕', color: 'text-orange-500' };
    if (score >= 45) return { text: '중립', color: 'text-yellow-500' };
    if (score >= 25) return { text: '공포', color: 'text-blue-500' };
    return { text: '극도의 공포', color: 'text-green-500' };
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">심리 지표</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fear & Greed Index */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">Fear & Greed Index</h3>
            <button 
              onClick={fetchFearGreed}
              disabled={loading === 'fearGreed'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {loading === 'fearGreed' ? '로딩...' : '업데이트'}
            </button>
          </div>
          {fearGreed !== null ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{fearGreed}</div>
              <div className={`text-lg font-semibold ${getFearGreedStatus(fearGreed).color}`}>
                {getFearGreedStatus(fearGreed).text}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              업데이트 버튼을 클릭하세요
            </div>
          )}
        </div>

        {/* 신용거래 잔고 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">신용거래 잔고</h3>
            <button 
              onClick={fetchCreditBalance}
              disabled={loading === 'credit'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {loading === 'credit' ? '로딩...' : '업데이트'}
            </button>
          </div>
          {creditBalance ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">신용매수:</span>
                <span className="text-white">{formatCurrency(creditBalance.creditBuy)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">신용매도:</span>
                <span className="text-white">{formatCurrency(creditBalance.creditSell)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-gray-300">순잔고:</span>
                <span className={creditBalance.net >= 0 ? 'text-red-400' : 'text-blue-400'}>
                  {formatCurrency(Math.abs(creditBalance.net))}
                  {creditBalance.net >= 0 ? ' (매수우위)' : ' (매도우위)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              업데이트 버튼을 클릭하세요
            </div>
          )}
        </div>

        {/* M2 통화량 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">M2 통화량</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              value={m2} 
              onChange={e => setM2(e.target.value)}
              placeholder="M2 통화량 입력 (예: 3.2%)"
              className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500 placeholder-gray-400"
            />
            {m2 && (
              <div className="text-center">
                <div className="text-xl font-bold text-white">M2: {m2}</div>
                <div className="text-sm text-gray-300 mt-1">
                  {parseFloat(m2) > 5 ? '높은 유동성' : parseFloat(m2) > 2 ? '보통 유동성' : '낮은 유동성'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 유동성 지표 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">유동성 지표</h3>
            <button 
              onClick={fetchLiquidity}
              disabled={loading === 'liquidity'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {loading === 'liquidity' ? '로딩...' : '업데이트'}
            </button>
          </div>
          {liquidity ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">시가총액:</span>
                <span className="text-white">{formatCurrency(liquidity.marketCap)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">거래대금:</span>
                <span className="text-white">{formatCurrency(liquidity.tradingVolume)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-gray-300">유동성 비율:</span>
                <span className="text-white">{liquidity.liquidityRatio}%</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              업데이트 버튼을 클릭하세요
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">종합 분석</h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p>• Fear & Greed Index: 시장 참가자들의 심리 상태를 나타냅니다.</p>
          <p>• 신용거래 잔고: 개인투자자들의 레버리지 사용 현황을 보여줍니다.</p>
          <p>• M2 통화량: 시중 유동성의 증가율을 나타냅니다.</p>
          <p>• 유동성 지표: 시장의 거래 활성도를 측정합니다.</p>
        </div>
      </div>
    </div>
  );
}

export default PsychologyIndicators;