import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import JournalForm from '../components/JournalForm';
import { JournalDetail } from '../components/JournalDetail';
import AssetChangeChart from '../components/AssetChangeChart';
import { InvestmentJournal } from '../types/investment';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Index() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedJournal, setSelectedJournal] = useState<InvestmentJournal | null>(null);
  const [journals, setJournals] = useState<InvestmentJournal[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1300); // 기본 환율

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        loadJournals();
      }
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        loadJournals();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadJournals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investment_journals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // v27 데이터를 v12 형식으로 안전하게 변환
      const convertedJournals = (data || []).map(journal => ({
        id: journal.id,
        date: journal.date || new Date().toISOString().split('T')[0],
        totalAssets: journal.total_assets || 0,
        evaluation: journal.evaluation || 0,
        foreignStocks: Array.isArray(journal.foreign_stocks) ? journal.foreign_stocks : [],
        domesticStocks: Array.isArray(journal.domestic_stocks) ? journal.domestic_stocks : [],
        cash: journal.cash || { krw: 0, usd: 0 },
        cryptocurrency: Array.isArray(journal.cryptocurrency) ? journal.cryptocurrency : [],
        trades: journal.trades || '',
        psychologyCheck: journal.psychology_check || { fearGreedIndex: 50 },
        bullMarketChecklist: Array.isArray(journal.bull_market_checklist) ? journal.bull_market_checklist : [],
        bearMarketChecklist: Array.isArray(journal.bear_market_checklist) ? journal.bear_market_checklist : [],
        marketIssues: journal.market_issues || '',
        memo: journal.memo || ''
      }));
      
      console.log('로드된 일지 데이터:', convertedJournals); // 디버깅용
      setJournals(convertedJournals);
    } catch (error) {
      console.error('일지 로드 실패:', error);
      alert('일지를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) console.error('로그인 오류:', error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('로그아웃 오류:', error);
  };

  // 차트 포인트 클릭 시 해당 날짜의 일지 찾기
  const handleChartPointClick = (date: string) => {
    console.log('차트 클릭된 날짜:', date); // 디버깅용
    const journal = journals.find(j => j.date === date);
    if (journal) {
      console.log('찾은 일지:', journal); // 디버깅용
      setSelectedJournal(journal);
      setCurrentView('detail');
    } else {
      alert(`${date}에 작성된 일지가 없습니다.`);
    }
  };

  // 일지 목록에서 클릭 시 상세보기
  const handleJournalClick = (journal: InvestmentJournal) => {
    console.log('클릭된 일지:', journal); // 디버깅용
    setSelectedJournal(journal);
    setCurrentView('detail');
  };

  // 일지 삭제 핸들러
  const handleJournalDelete = async (journalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('investment_journals')
        .delete()
        .eq('id', journalId)
        .eq('user_id', user.id); // 보안을 위해 user_id도 확인

      if (error) throw error;

      // 일지 목록 새로고침
      await loadJournals();
      
      // 상세보기에서 목록으로 이동
      setCurrentView('list');
      setSelectedJournal(null);
      
      alert('일지가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('일지 삭제 실패:', error);
      alert('일지 삭제에 실패했습니다.');
    }
  };

  const handleJournalSubmit = async (journal: InvestmentJournal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // v12 -> v27 데이터 변환
      const journalData = {
        user_id: user.id,
        date: journal.date,
        total_assets: Math.floor(journal.totalAssets || 0),
        evaluation: Math.floor(journal.evaluation || 0),
        foreign_stocks: journal.foreignStocks || [],
        domestic_stocks: journal.domesticStocks || [],
        cash: journal.cash || { krw: 0, usd: 0 },
        cryptocurrency: journal.cryptocurrency || [],
        trades: journal.trades || '',
        psychology_check: journal.psychologyCheck || {},
        bull_market_checklist: journal.bullMarketChecklist || [],
        bear_market_checklist: journal.bearMarketChecklist || [],
        market_issues: journal.marketIssues || '',
        memo: journal.memo || '',
        is_public: false,
        updated_at: new Date().toISOString()
      };

      if (selectedJournal?.id) {
        // 수정
        const { error } = await supabase
          .from('investment_journals')
          .update(journalData)
          .eq('id', selectedJournal.id);
        if (error) throw error;
      } else {
        // 새로 생성
        const { error } = await supabase
          .from('investment_journals')
          .insert(journalData);
        if (error) throw error;
      }

      await loadJournals();
      setCurrentView('list');
      setSelectedJournal(null);
      alert('일지가 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('일지 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">투자 매매일지</h1>
          <p className="text-xl mb-8 text-gray-300">체계적인 투자 기록과 분석을 위한 도구</p>
          <button 
            onClick={signInWithGoogle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Google로 시작하기
          </button>
          <p className="text-sm text-gray-400 mt-4">
            로그인하면 투자일지 작성, 포트폴리오 분석 등 모든 기능을 이용할 수 있습니다
          </p>
        </div>
      </div>
    );
  }

  // 일지 상세보기
  if (currentView === 'detail' && selectedJournal) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <JournalDetail
          journal={selectedJournal}
          onBack={() => {
            setCurrentView('list');
            setSelectedJournal(null);
          }}
          onEdit={() => setCurrentView('form')}
          onDelete={handleJournalDelete}
          exchangeRate={exchangeRate}
        />
      </div>
    );
  }

  // 일지 작성/수정 폼
  if (currentView === 'form') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <JournalForm
          onSubmit={handleJournalSubmit}
          initialData={selectedJournal}
          onCancel={() => {
            setCurrentView('list');
            setSelectedJournal(null);
          }}
        />
      </div>
    );
  }

  // 메인 대시보드 (심리지표 제거됨)
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">투자 매매일지</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedJournal(null);
                setCurrentView('form');
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              새 일지 작성
            </button>
            <span className="text-gray-300">안녕하세요, {user.user_metadata?.full_name || user.email}님</span>
            <button 
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 space-y-8">
        {/* 차트 - 클릭 기능 포함 */}
        <AssetChangeChart onPointClick={handleChartPointClick} />

        {/* 최근 일지 목록 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">최근 투자일지</h2>
          {journals.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>작성된 일지가 없습니다.</p>
              <p>첫 번째 투자일지를 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.slice(0, 10).map((journal) => (
                <div
                  key={journal.id}
                  onClick={() => handleJournalClick(journal)}
                  className="flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-medium">{journal.date}</div>
                    <div className="text-sm text-gray-400">
                      총 자산: {(journal.totalAssets || 0).toLocaleString()}원
                    </div>
                    {journal.memo && (
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-md">
                        {journal.memo.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">평가손익</div>
                    <div className={`font-semibold ${
                      (journal.evaluation || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(journal.evaluation || 0) >= 0 ? '+' : ''}{(journal.evaluation || 0).toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Index;