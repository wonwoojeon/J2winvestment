import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, Save, X, TrendingUp, TrendingDown, DollarSign, Brain, BarChart3 } from 'lucide-react';
import { InvestmentJournal, Stock, ChecklistItem } from '@/types/investment';
import { getDefaultChecklists } from '@/lib/storage';

interface JournalFormProps {
  onSubmit: (journal: InvestmentJournal) => void;
  initialData?: InvestmentJournal | null;
  onCancel: () => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<InvestmentJournal>({
    id: initialData?.id || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    totalAssets: initialData?.totalAssets || 0,
    evaluation: initialData?.evaluation || 0,
    foreignStocks: initialData?.foreignStocks || [],
    domesticStocks: initialData?.domesticStocks || [],
    cash: initialData?.cash || { krw: 0, usd: 0 },
    cryptocurrency: initialData?.cryptocurrency || [],
    trades: initialData?.trades || '',
    psychologyCheck: initialData?.psychologyCheck || { 
      fearGreedIndex: 50,
      confidenceLevel: '',
      m2MoneySupply: '',
      marketSentiments: []
    },
    bullMarketChecklist: initialData?.bullMarketChecklist || [],
    bearMarketChecklist: initialData?.bearMarketChecklist || [],
    marketIssues: initialData?.marketIssues || '',
    memo: initialData?.memo || ''
  });

  const [exchangeRate, setExchangeRate] = useState(1300); // USD/KRW 환율

  useEffect(() => {
    if (!initialData) {
      // storage.ts에서 기본 체크리스트 가져오기
      const defaultChecklists = getDefaultChecklists();
      
      // 문자열 배열을 ChecklistItem 배열로 변환
      const bullMarketChecklist: ChecklistItem[] = defaultChecklists.bullMarket.map((text, index) => ({
        id: `bull-${index}`,
        text,
        checked: false
      }));
      
      const bearMarketChecklist: ChecklistItem[] = defaultChecklists.bearMarket.map((text, index) => ({
        id: `bear-${index}`,
        text,
        checked: false
      }));

      setFormData(prev => ({
        ...prev,
        bullMarketChecklist,
        bearMarketChecklist
      }));
    }
  }, [initialData]);

  // 자동 계산 로직
  useEffect(() => {
    const calculateTotalAssets = () => {
      // 해외주식 총액 (USD -> KRW)
      const foreignTotal = formData.foreignStocks.reduce((sum, stock) => 
        sum + (stock.price * stock.quantity), 0) * exchangeRate;
      
      // 국내주식 총액
      const domesticTotal = formData.domesticStocks.reduce((sum, stock) => 
        sum + (stock.price * stock.quantity), 0);
      
      // 암호화폐 총액 (USD -> KRW)
      const cryptoTotal = formData.cryptocurrency.reduce((sum, crypto) => 
        sum + (crypto.price * crypto.quantity), 0) * exchangeRate;
      
      // 현금 총액
      const cashTotal = (formData.cash.krw || 0) + ((formData.cash.usd || 0) * exchangeRate);
      
      const total = foreignTotal + domesticTotal + cryptoTotal + cashTotal;
      
      setFormData(prev => ({
        ...prev,
        totalAssets: Math.floor(total)
      }));
    };

    calculateTotalAssets();
  }, [formData.foreignStocks, formData.domesticStocks, formData.cryptocurrency, formData.cash, exchangeRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 주식 추가 - 완전한 이벤트 방지
  const addStock = (type: 'foreignStocks' | 'domesticStocks' | 'cryptocurrency') => {
    const newStock: Stock = {
      id: Date.now().toString(),
      symbol: '',
      quantity: 0,
      price: 0
    };
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newStock]
    }));
  };

  // 주식 업데이트
  const updateStock = (type: 'foreignStocks' | 'domesticStocks' | 'cryptocurrency', index: number, field: keyof Stock, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((stock, i) => 
        i === index ? { ...stock, [field]: value } : stock
      )
    }));
  };

  // 주식 삭제 - 완전한 이벤트 방지
  const removeStock = (type: 'foreignStocks' | 'domesticStocks' | 'cryptocurrency', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // 체크리스트 업데이트
  const updateChecklistItem = (type: 'bullMarketChecklist' | 'bearMarketChecklist', index: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, checked } : item
      )
    }));
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onCancel} 
              className="border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              취소
            </Button>
            <h1 className="text-2xl font-bold">
              {initialData ? '투자일지 수정' : '새 투자일지 작성'}
            </h1>
          </div>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-700 p-4">
              <CardTitle className="text-lg font-semibold text-white">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="date" className="text-gray-300">날짜</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="exchangeRate" className="text-gray-300">환율 (USD/KRW)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="totalAssets" className="text-gray-300">총 자산 (자동계산)</Label>
                  <Input
                    id="totalAssets"
                    type="text"
                    value={`${formatNumber(formData.totalAssets)}원`}
                    readOnly
                    className="bg-gray-600 border-gray-500 text-blue-400 font-bold"
                  />
                </div>
                <div>
                  <Label htmlFor="evaluation" className="text-gray-300">평가손익 (원)</Label>
                  <Input
                    id="evaluation"
                    type="number"
                    value={formData.evaluation}
                    onChange={(e) => setFormData(prev => ({ ...prev, evaluation: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 자산 입력 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 해외주식 */}
            <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-700 p-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    해외주식 (USD)
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => addStock('foreignStocks')} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {formData.foreignStocks.map((stock, index) => (
                    <div key={stock.id} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        placeholder="종목명"
                        value={stock.symbol}
                        onChange={(e) => updateStock('foreignStocks', index, 'symbol', e.target.value)}
                        className="col-span-4 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="수량"
                        value={stock.quantity}
                        onChange={(e) => updateStock('foreignStocks', index, 'quantity', Number(e.target.value))}
                        className="col-span-3 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="가격($)"
                        value={stock.price}
                        onChange={(e) => updateStock('foreignStocks', index, 'price', Number(e.target.value))}
                        className="col-span-4 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeStock('foreignStocks', index)}
                        className="col-span-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.foreignStocks.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      해외주식을 추가해보세요
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 국내주식 */}
            <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-700 p-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    국내주식 (KRW)
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => addStock('domesticStocks')} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {formData.domesticStocks.map((stock, index) => (
                    <div key={stock.id} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        placeholder="종목명"
                        value={stock.symbol}
                        onChange={(e) => updateStock('domesticStocks', index, 'symbol', e.target.value)}
                        className="col-span-4 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="수량"
                        value={stock.quantity}
                        onChange={(e) => updateStock('domesticStocks', index, 'quantity', Number(e.target.value))}
                        className="col-span-3 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="가격(원)"
                        value={stock.price}
                        onChange={(e) => updateStock('domesticStocks', index, 'price', Number(e.target.value))}
                        className="col-span-4 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeStock('domesticStocks', index)}
                        className="col-span-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.domesticStocks.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      국내주식을 추가해보세요
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 암호화폐 */}
            <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-700 p-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">₿</span>
                    암호화폐 (USD)
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => addStock('cryptocurrency')} 
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {formData.cryptocurrency.map((crypto, index) => (
                    <div key={crypto.id} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        placeholder="코인명"
                        value={crypto.symbol}
                        onChange={(e) => updateStock('cryptocurrency', index, 'symbol', e.target.value)}
                        className="col-span-4 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="수량"
                        value={crypto.quantity}
                        onChange={(e) => updateStock('cryptocurrency', index, 'quantity', Number(e.target.value))}
                        className="col-span-3 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="가격($)"
                        value={crypto.price}
                        onChange={(e) => updateStock('cryptocurrency', index, 'price', Number(e.target.value))}
                        className="col-span-4 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeStock('cryptocurrency', index)}
                        className="col-span-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.cryptocurrency.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      암호화폐를 추가해보세요
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 현금 */}
            <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-700 p-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  현금 보유액
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="cashKrw" className="text-gray-300">원화 (KRW)</Label>
                  <Input
                    id="cashKrw"
                    type="number"
                    value={formData.cash.krw}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cash: { ...prev.cash, krw: Number(e.target.value) }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cashUsd" className="text-gray-300">달러 (USD)</Label>
                  <Input
                    id="cashUsd"
                    type="number"
                    step="0.01"
                    value={formData.cash.usd}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cash: { ...prev.cash, usd: Number(e.target.value) }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 심리 지표 (이미지에서 보인 섹션) */}
          <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-700 p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <Brain className="h-5 w-5 text-purple-500" />
                심리 지표
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fear & Greed Index */}
                <div>
                  <Label htmlFor="fearGreedIndex" className="text-gray-300 mb-2 block">Fear & Greed Index</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fearGreedIndex"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.psychologyCheck?.fearGreedIndex || 50}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        psychologyCheck: {
                          ...prev.psychologyCheck,
                          fearGreedIndex: Number(e.target.value)
                        }
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                      업데이트
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">업데이트 버튼을 클릭하세요</div>
                </div>

                {/* 신용거래 잔고 */}
                <div>
                  <Label htmlFor="confidenceLevel" className="text-gray-300 mb-2 block">신용거래 잔고</Label>
                  <div className="flex gap-2">
                    <Input
                      id="confidenceLevel"
                      type="text"
                      value={formData.psychologyCheck?.confidenceLevel || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        psychologyCheck: {
                          ...prev.psychologyCheck,
                          confidenceLevel: e.target.value
                        }
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="예: 3.2조원"
                    />
                    <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                      업데이트
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">업데이트 버튼을 클릭하세요</div>
                </div>

                {/* M2 통화량 */}
                <div>
                  <Label htmlFor="m2MoneySupply" className="text-gray-300 mb-2 block">M2 통화량</Label>
                  <Input
                    id="m2MoneySupply"
                    type="text"
                    value={formData.psychologyCheck?.m2MoneySupply || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      psychologyCheck: {
                        ...prev.psychologyCheck,
                        m2MoneySupply: e.target.value
                      }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="M2 통화량 입력 (예: 3.2%)"
                  />
                </div>

                {/* 유동성 지표 */}
                <div>
                  <Label className="text-gray-300 mb-2 block">유동성 지표</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="유동성 지표 입력"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                      업데이트
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">업데이트 버튼을 클릭하세요</div>
                </div>
              </div>

              {/* 종합 분석 */}
              <div className="mt-6">
                <h4 className="text-gray-300 font-medium mb-3">종합 분석</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>• Fear & Greed Index: 시장 참가자들의 심리 상태를 나타냅니다.</div>
                  <div>• 신용거래 잔고: 개인투자자들의 레버리지 사용 현황을 보여줍니다.</div>
                  <div>• M2 통화량: 시중 유동성의 증가율을 나타냅니다.</div>
                  <div>• 유동성 지표: 시장의 거래 활성도를 측정합니다.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 투자 심리 체크리스트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 상승장 체크리스트 */}
            <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-700 p-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  상승장 체크리스트
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {formData.bullMarketChecklist.map((item, index) => (
                    <label key={item.id} className="flex items-start space-x-3 text-white cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => updateChecklistItem('bullMarketChecklist', index, e.target.checked)}
                        className="mt-1 rounded text-green-500 focus:ring-green-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {item.checked ? '✅' : '☐'}
                        </span>
                        <span className={`text-sm ${item.checked ? 'text-green-300' : 'text-gray-300'}`}>
                          {item.text}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 하락장 체크리스트 */}
            <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-700 p-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  하락장 체크리스트
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {formData.bearMarketChecklist.map((item, index) => (
                    <label key={item.id} className="flex items-start space-x-3 text-white cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => updateChecklistItem('bearMarketChecklist', index, e.target.checked)}
                        className="mt-1 rounded text-red-500 focus:ring-red-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {item.checked ? '✅' : '☐'}
                        </span>
                        <span className={`text-sm ${item.checked ? 'text-red-300' : 'text-gray-300'}`}>
                          {item.text}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 매매내역 및 메모 */}
          <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-700 p-4">
              <CardTitle className="text-lg font-semibold text-white">매매내역 및 메모</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="trades" className="text-gray-300">매매내역</Label>
                <Textarea
                  id="trades"
                  value={formData.trades}
                  onChange={(e) => setFormData(prev => ({ ...prev, trades: e.target.value }))}
                  placeholder="오늘의 매매 내역을 기록하세요 (매수/매도, 종목, 수량, 가격 등)"
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="marketIssues" className="text-gray-300">시장 이슈</Label>
                <Textarea
                  id="marketIssues"
                  value={formData.marketIssues}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketIssues: e.target.value }))}
                  placeholder="주요 시장 이슈나 뉴스를 기록하세요"
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="memo" className="text-gray-300">투자 메모</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="오늘의 투자 소감이나 중요한 생각을 기록하세요"
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white"
            >
              취소
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {initialData ? '수정 완료' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalForm;