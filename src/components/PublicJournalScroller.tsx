import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, User } from 'lucide-react';
import { InvestmentJournal } from '@/types/investment';
import { getPublicJournals } from '@/lib/firestore';

interface PublicJournalScrollerProps {
  onSelectJournal: (journal: InvestmentJournal, userName: string) => void;
}

interface PublicJournalWithUser extends InvestmentJournal {
  userName: string;
  userPhotoURL?: string;
}

export function PublicJournalScroller({ onSelectJournal }: PublicJournalScrollerProps) {
  const [publicJournals, setPublicJournals] = useState<PublicJournalWithUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    loadPublicJournals();
  }, []);

  // 자동 스크롤링
  useEffect(() => {
    if (!isAutoScrolling || publicJournals.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publicJournals.length);
    }, 3000); // 3초마다 스크롤

    return () => clearInterval(interval);
  }, [isAutoScrolling, publicJournals.length]);

  const loadPublicJournals = async () => {
    try {
      const journals = await getPublicJournals();
      setPublicJournals(journals);
    } catch (error) {
      console.error('공개 일지 로드 실패:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const man = Math.floor((amount % 100000000) / 10000);
      return man > 0 ? `${eok}억${man}만원` : `${eok}억원`;
    } else if (amount >= 10000) {
      const man = Math.floor(amount / 10000);
      return `${man}만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  const handlePrevious = () => {
    setIsAutoScrolling(false);
    setCurrentIndex((prev) => (prev - 1 + publicJournals.length) % publicJournals.length);
  };

  const handleNext = () => {
    setIsAutoScrolling(false);
    setCurrentIndex((prev) => (prev + 1) % publicJournals.length);
  };

  const handleJournalClick = (journal: PublicJournalWithUser) => {
    onSelectJournal(journal, journal.userName);
  };

  if (publicJournals.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p>공개된 투자일지가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleJournals = publicJournals.slice(currentIndex, currentIndex + 3).concat(
    publicJournals.slice(0, Math.max(0, currentIndex + 3 - publicJournals.length))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          다른 투자자들의 일지
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={publicJournals.length <= 3}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={publicJournals.length <= 3}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleJournals.map((journal, index) => (
          <Card 
            key={`${journal.id}-${index}`}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => handleJournalClick(journal)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* 사용자 정보 */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {journal.userPhotoURL ? (
                      <img 
                        src={journal.userPhotoURL} 
                        alt={journal.userName}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-blue-600">
                        {journal.userName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{journal.userName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {journal.date}
                    </div>
                  </div>
                </div>

                {/* 자산 정보 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">총 자산</span>
                    <Badge variant="secondary" className="font-semibold">
                      {formatCurrency(journal.totalAssets)}
                    </Badge>
                  </div>
                  
                  {journal.evaluation !== journal.totalAssets && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">평가액</span>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(journal.evaluation)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 간단한 포트폴리오 정보 */}
                <div className="text-xs text-muted-foreground">
                  {journal.foreignStocks.length > 0 && (
                    <span>해외주식 {journal.foreignStocks.length}종목 </span>
                  )}
                  {journal.domesticStocks.length > 0 && (
                    <span>국내주식 {journal.domesticStocks.length}종목 </span>
                  )}
                  {journal.cryptocurrency.length > 0 && (
                    <span>암호화폐 {journal.cryptocurrency.length}종목</span>
                  )}
                </div>

                {/* 메모 미리보기 */}
                {journal.memo && (
                  <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
                    "{journal.memo.substring(0, 50)}{journal.memo.length > 50 ? '...' : ''}"
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 인디케이터 */}
      {publicJournals.length > 3 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: Math.ceil(publicJournals.length / 3) }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / 3) === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}