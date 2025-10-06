import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, TrendingUp, TrendingDown, DollarSign, CheckCircle, FileText, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { InvestmentJournal } from '@/types/investment';

interface JournalDetailProps {
  journal: InvestmentJournal;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  exchangeRate: number;
}

export const JournalDetail = ({ journal, onBack, onEdit, onDelete, exchangeRate }: JournalDetailProps) => {
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    assetDetails: false,
    trades: false,
    psychology: true,
    checklists: true,
    memo: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 삭제 확인 함수
  const handleDelete = () => {
    const firstConfirm = window.confirm(`정말로 ${journal.date} 일지를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (firstConfirm) {
      const secondConfirm = window.confirm(`한 번 더 확인합니다.\n\n${journal.date} 투자일지를 완전히 삭제하시겠습니까?`);
      
      if (secondConfirm) {
        onDelete(journal.id);
      }
    }
  };

  // 안전한 데이터 접근을 위한 기본값 설정
  const safeJournal = {
    ...journal,
    foreignStocks: journal.foreignStocks || [],
    domesticStocks: journal.domesticStocks || [],
    cryptocurrency: journal.cryptocurrency || [],
    cash: journal.cash || { krw: 0, usd: 0 },
    psychologyCheck: journal.psychologyCheck || { fearGreedIndex: 50 },
    bullMarketChecklist: journal.bullMarketChecklist || [],
    bearMarketChecklist: journal.bearMarketChecklist || []
  };

  // 해외주식 총액 (USD -> KRW) - 완전한 안전성 보장
  const foreignStocksTotal = safeJournal.foreignStocks.reduce((sum, stock) => {
    const price = Number(stock?.price) || 0;
    const quantity = Number(stock?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const foreignStocksTotalKRW = foreignStocksTotal * exchangeRate;

  // 국내주식 총액 - 안전성 보장
  const domesticStocksTotal = safeJournal.domesticStocks.reduce((sum, stock) => {
    const price = Number(stock?.price) || 0;
    const quantity = Number(stock?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // 암호화폐 총액 (USD -> KRW) - 안전성 보장
  const cryptoTotal = safeJournal.cryptocurrency.reduce((sum, stock) => {
    const price = Number(stock?.price) || 0;
    const quantity = Number(stock?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const cryptoTotalKRW = cryptoTotal * exchangeRate;

  // 현금 총액 - 안전성 보장
  const cashKrw = Number(safeJournal.cash.krw) || 0;
  const cashUsd = Number(safeJournal.cash.usd) || 0;
  const cashTotal = cashKrw + (cashUsd * exchangeRate);

  // 전체 자산 총액
  const totalAssets = foreignStocksTotalKRW + domesticStocksTotal + cryptoTotalKRW + cashTotal;

  const formatNumber = (num: number) => {
    return isNaN(num) ? '0' : Math.floor(num).toLocaleString();
  };

  // 디버깅을 위한 콘솔 로그
  console.log('JournalDetail 렌더링:', {
    journalId: journal.id,
    date: journal.date,
    totalAssets: journal.totalAssets,
    foreignStocks: journal.foreignStocks?.length || 0,
    domesticStocks: journal.domesticStocks?.length || 0
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      {/* 헤더 - 토스 스타일: 미니멀, 간격 조정 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
          <h1 className="text-2xl font-bold">{journal.date} 투자일지</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleDelete} 
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            수정
          </Button>
        </div>
      </div>

      {/* 자산 현황 - 토스 스타일: 둥근 카드, shadow, 액센트 색상 */}
      <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
        <CardHeader className="cursor-pointer bg-gray-700 p-4" onClick={() => toggleSection('assets')}>
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              자산 현황
            </div>
            {expandedSections.assets ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.assets && (
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-700 rounded-md shadow-sm">
                <div className="text-sm text-gray-400">총 자산</div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatNumber(journal.totalAssets || totalAssets)}원
                </div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-md shadow-sm">
                <div className="text-sm text-gray-400">해외주식</div>
                <div className="text-lg font-semibold text-white">
                  {formatNumber(foreignStocksTotalKRW)}원
                </div>
                <div className="text-xs text-gray-500">
                  ${formatNumber(foreignStocksTotal)}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-md shadow-sm">
                <div className="text-sm text-gray-400">국내주식</div>
                <div className="text-lg font-semibold text-white">
                  {formatNumber(domesticStocksTotal)}원
                </div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-md shadow-sm">
                <div className="text-sm text-gray-400">평가손익</div>
                <div className={`text-lg font-semibold ${
                  (journal.evaluation || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(journal.evaluation || 0) >= 0 ? '+' : ''}{formatNumber(journal.evaluation || 0)}원
                </div>
              </div>
            </div>

            {/* 자산 상세 - 토스 스타일: 버튼 hover 효과 */}
            <div className="border-t border-gray-700 pt-4">
              <Button
                variant="ghost"
                onClick={() => toggleSection('assetDetails')}
                className="w-full flex items-center justify-between text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <span>자산 상세 보기</span>
                {expandedSections.assetDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {expandedSections.assetDetails && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* 해외주식 - 토스 스타일: 미니 카드 */}
                  {safeJournal.foreignStocks.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-300">
                        <Badge variant="outline" className="border-blue-500 text-blue-500">해외주식</Badge>
                      </h3>
                      <div className="space-y-2">
                        {safeJournal.foreignStocks.map((stock, index) => (
                          <div key={stock.id || index} className="flex justify-between items-center p-3 bg-gray-700 rounded-md shadow-sm">
                            <div>
                              <div className="font-medium text-white">{stock.symbol || '미지정'}</div>
                              <div className="text-sm text-gray-400">
                                {formatNumber(stock.quantity || 0)}주 × ${formatNumber(stock.price || 0)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-white">
                                {formatNumber((stock.price || 0) * (stock.quantity || 0) * exchangeRate)}원
                              </div>
                              <div className="text-sm text-gray-500">
                                ${formatNumber((stock.price || 0) * (stock.quantity || 0))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 국내주식 */}
                  {safeJournal.domesticStocks.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-300">
                        <Badge variant="outline" className="border-blue-500 text-blue-500">국내주식</Badge>
                      </h3>
                      <div className="space-y-2">
                        {safeJournal.domesticStocks.map((stock, index) => (
                          <div key={stock.id || index} className="flex justify-between items-center p-3 bg-gray-700 rounded-md shadow-sm">
                            <div>
                              <div className="font-medium text-white">{stock.symbol || '미지정'}</div>
                              <div className="text-sm text-gray-400">
                                {formatNumber(stock.quantity || 0)}주 × {formatNumber(stock.price || 0)}원
                              </div>
                            </div>
                            <div className="font-semibold text-white">
                              {formatNumber((stock.price || 0) * (stock.quantity || 0))}원
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 현금 */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-300">
                      <Badge variant="outline" className="border-blue-500 text-blue-500">현금</Badge>
                    </h3>
                    <div className="space-y-2">
                      {cashKrw > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md shadow-sm">
                          <div className="font-medium text-white">원화 (KRW)</div>
                          <div className="font-semibold text-white">{formatNumber(cashKrw)}원</div>
                        </div>
                      )}
                      {cashUsd > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md shadow-sm">
                          <div className="font-medium text-white">달러 (USD)</div>
                          <div className="text-right">
                            <div className="font-semibold text-white">
                              {formatNumber(cashUsd * exchangeRate)}원
                            </div>
                            <div className="text-sm text-gray-500">
                              ${formatNumber(cashUsd)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 매매내역 - 토스 스타일 */}
      {journal.trades && (
        <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="cursor-pointer bg-gray-700 p-4" onClick={() => toggleSection('trades')}>
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                매매내역
              </div>
              {expandedSections.trades ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.trades && (
            <CardContent className="p-4">
              <div className="whitespace-pre-wrap text-sm bg-gray-700 p-4 rounded-md text-gray-300">
                {journal.trades}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 체크리스트 - 토스 스타일: 미니멀 리스트, 색상 액센트 */}
      {(safeJournal.bullMarketChecklist.length > 0 || safeJournal.bearMarketChecklist.length > 0) && (
        <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="cursor-pointer bg-gray-700 p-4" onClick={() => toggleSection('checklists')}>
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                투자 체크리스트
              </div>
              {expandedSections.checklists ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.checklists && (
            <CardContent className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 상승장 체크리스트 */}
                {safeJournal.bullMarketChecklist.length > 0 && (
                  <div>
                    <h3 className="text-green-400 flex items-center gap-2 mb-4 text-lg font-semibold">
                      <TrendingUp className="h-5 w-5" />
                      상승장 체크리스트
                    </h3>
                    <div className="space-y-2">
                      {safeJournal.bullMarketChecklist.map((item, index) => (
                        <div key={item.id || index} className="flex items-center gap-2 text-sm text-gray-300">
                          <span>{item.checked ? '✅' : '☐'}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      체크된 항목: {safeJournal.bullMarketChecklist.filter(item => item.checked).length}개 / 전체: {safeJournal.bullMarketChecklist.length}개
                    </div>
                  </div>
                )}

                {/* 하락장 체크리스트 */}
                {safeJournal.bearMarketChecklist.length > 0 && (
                  <div>
                    <h3 className="text-red-400 flex items-center gap-2 mb-4 text-lg font-semibold">
                      <TrendingDown className="h-5 w-5" />
                      하락장 체크리스트
                    </h3>
                    <div className="space-y-2">
                      {safeJournal.bearMarketChecklist.map((item, index) => (
                        <div key={item.id || index} className="flex items-center gap-2 text-sm text-gray-300">
                          <span>{item.checked ? '✅' : '☐'}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      체크된 항목: {safeJournal.bearMarketChecklist.filter(item => item.checked).length}개 / 전체: {safeJournal.bearMarketChecklist.length}개
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 시장 이슈 및 메모 - 토스 스타일 */}
      {(journal.marketIssues || journal.memo) && (
        <Card className="bg-gray-800 border-0 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="cursor-pointer bg-gray-700 p-4" onClick={() => toggleSection('memo')}>
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                메모 및 이슈
              </div>
              {expandedSections.memo ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.memo && (
            <CardContent className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {journal.marketIssues && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-300">시장 이슈</h3>
                    <div className="whitespace-pre-wrap text-sm bg-gray-700 p-4 rounded-md text-gray-300">
                      {journal.marketIssues}
                    </div>
                  </div>
                )}

                {journal.memo && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-300">투자 메모</h3>
                    <div className="whitespace-pre-wrap text-sm bg-gray-700 p-4 rounded-md text-gray-300">
                      {journal.memo}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};