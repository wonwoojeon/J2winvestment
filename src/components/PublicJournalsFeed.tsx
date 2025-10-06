import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, Users } from 'lucide-react';
import { InvestmentJournal } from '@/types/investment';

interface UserSearchResult {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  journalCount: number;
  lastJournalDate: string;
}

interface PublicJournalWithUser extends InvestmentJournal {
  user: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
}

interface PublicJournalsFeedProps {
  onSelectUser: (user: UserSearchResult, journals: InvestmentJournal[]) => void;
}

export function PublicJournalsFeed({ onSelectUser }: PublicJournalsFeedProps) {
  const [publicJournals, setPublicJournals] = useState<PublicJournalWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPublicJournals();
  }, []);

  useEffect(() => {
    // 자동 스크롤 애니메이션
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || publicJournals.length === 0) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    const animate = () => {
      if (scrollContainer) {
        scrollPosition += scrollSpeed;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
    };

    const interval = setInterval(animate, 50);

    const handleMouseEnter = () => clearInterval(interval);
    const handleMouseLeave = () => {
      const newInterval = setInterval(animate, 50);
      return newInterval;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(interval);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [publicJournals]);

  const loadPublicJournals = async () => {
    try {
      setIsLoading(true);
      
      // 데모용 공개 일지 데이터
      const demoJournals: PublicJournalWithUser[] = [
        {
          id: 'demo1',
          date: '2024-01-15',
          totalAssets: 50000000,
          evaluation: 52000000,
          foreignStocks: [{ symbol: 'AAPL', quantity: 10, price: 180 }],
          domesticStocks: [{ symbol: '삼성전자', quantity: 20, price: 75000 }],
          cash: { krw: 10000000, usd: 5000 },
          cryptocurrency: [{ symbol: 'BTC', quantity: 0.1, price: 45000 }],
          checklist: [],
          memo: '애플 실적 발표 후 상승세 지속',
          user: {
            uid: 'demo-user-1',
            displayName: '투자왕김씨',
            photoURL: ''
          }
        },
        {
          id: 'demo2',
          date: '2024-01-14',
          totalAssets: 30000000,
          evaluation: 31500000,
          foreignStocks: [{ symbol: 'TSLA', quantity: 5, price: 250 }],
          domesticStocks: [{ symbol: 'SK하이닉스', quantity: 15, price: 130000 }],
          cash: { krw: 8000000, usd: 3000 },
          cryptocurrency: [],
          checklist: [],
          memo: '테슬라 배터리 기술 발전 기대',
          user: {
            uid: 'demo-user-2',
            displayName: '주식고수',
            photoURL: ''
          }
        }
      ];

      setPublicJournals(demoJournals);
    } catch (error) {
      console.error('공개 일지 로드 실패:', error);
      setPublicJournals([]);
    } finally {
      setIsLoading(false);
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

  const handleUserClick = async (journal: PublicJournalWithUser) => {
    try {
      const userJournals = publicJournals
        .filter(j => j.user.uid === journal.user.uid)
        .map(({ user, ...journalData }) => journalData);

      const userSearchResult: UserSearchResult = {
        uid: journal.user.uid,
        email: `${journal.user.displayName}@demo.com`,
        displayName: journal.user.displayName,
        photoURL: journal.user.photoURL,
        journalCount: userJournals.length,
        lastJournalDate: journal.date
      };

      onSelectUser(userSearchResult, userJournals);
    } catch (error) {
      console.error('사용자 선택 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            다른 투자자들의 일지
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          다른 투자자들의 일지
          <Badge variant="secondary" className="ml-2">
            실시간 업데이트
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {publicJournals.concat(publicJournals).map((journal, index) => {
            const growth = journal.evaluation !== journal.totalAssets 
              ? ((journal.evaluation - journal.totalAssets) / journal.totalAssets * 100)
              : 0;

            return (
              <Card 
                key={`${journal.id}-${index}`}
                className="min-w-[300px] hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => handleUserClick(journal)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {journal.user.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{journal.user.displayName}</h4>
                      <p className="text-xs text-gray-500">{journal.date}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">총 자산</span>
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(journal.totalAssets)}
                      </Badge>
                    </div>

                    {growth !== 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">수익률</span>
                        <div className={`flex items-center gap-1 text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className="h-3 w-3" />
                          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {journal.memo && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                        {journal.memo}
                      </p>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    일지 보기
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}