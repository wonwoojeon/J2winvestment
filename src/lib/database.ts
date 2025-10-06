import { supabase } from './supabase';

// 실제 Supabase 스키마에 맞춘 인터페이스
export interface InvestmentJournal {
  id?: string;
  userId: string;
  date: string;
  title?: string;
  totalAssets: number;
  foreignStocks: any[]; // jsonb
  domesticStocks: any[]; // jsonb
  cash: any; // jsonb
  cryptocurrency: any[]; // jsonb
  evaluation: number;
  trades?: string;
  psychologyCheck: any; // jsonb
  bullMarketChecklist: any[]; // jsonb
  bearMarketChecklist: any[]; // jsonb
  marketIssues?: string;
  memo?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 숫자를 안전한 정수로 변환하는 헬퍼 함수
const toSafeInteger = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  
  // 소수점 제거하고 정수로 변환
  return Math.floor(Math.abs(num));
};

// 에러 로깅 헬퍼 함수
const logError = (context: string, error: any) => {
  console.error(`${context}:`, {
    message: error?.message || 'Unknown error',
    code: error?.code || 'No code',
    details: error?.details || 'No details',
    hint: error?.hint || 'No hint',
    fullError: error
  });
};

// 사용자 프로필 관련 함수들
export const saveUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    console.log('프로필 저장 시도:', { userId, profile });
    
    const profileData = {
      id: userId,
      email: profile.email,
      display_name: profile.displayName,
      photo_url: profile.photoURL || null,
      is_public: profile.isPublic || false,
      updated_at: new Date().toISOString()
    };

    console.log('Supabase에 저장할 프로필 데이터:', profileData);

    const { data, error } = await supabase
      .from('users')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      logError('사용자 프로필 저장 실패', error);
      throw error;
    }

    console.log('사용자 프로필 저장 성공:', data);
  } catch (error) {
    logError('사용자 프로필 저장 catch 블록', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('프로필 조회 시도:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('사용자가 존재하지 않음:', userId);
        return null;
      }
      logError('사용자 프로필 조회 실패', error);
      throw error;
    }

    const profile = {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      photoURL: data.photo_url,
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('사용자 프로필 조회 성공:', profile);
    return profile;
  } catch (error) {
    logError('사용자 프로필 조회 catch 블록', error);
    throw error;
  }
};

// 투자일지 관련 함수들
export const saveInvestmentJournal = async (userId: string, journal: Omit<InvestmentJournal, 'id' | 'userId'>): Promise<string> => {
  try {
    console.log('일지 저장 시도:', { userId, journal });
    
    // 숫자 값들을 안전하게 변환
    const totalAssets = toSafeInteger(journal.totalAssets);
    const evaluation = toSafeInteger(journal.evaluation);
    
    console.log('변환된 숫자 값들:', { 
      원본_totalAssets: journal.totalAssets, 
      변환된_totalAssets: totalAssets,
      원본_evaluation: journal.evaluation,
      변환된_evaluation: evaluation
    });
    
    const journalData = {
      user_id: userId,
      date: journal.date,
      title: journal.title || null,
      total_assets: totalAssets,
      foreign_stocks: journal.foreignStocks || [],
      domestic_stocks: journal.domesticStocks || [],
      cash: journal.cash || { krw: 0, usd: 0 },
      cryptocurrency: journal.cryptocurrency || [],
      evaluation: evaluation,
      trades: journal.trades || null,
      psychology_check: journal.psychologyCheck || { fearGreedIndex: 50, creditConcern: false },
      bull_market_checklist: journal.bullMarketChecklist || [],
      bear_market_checklist: journal.bearMarketChecklist || [],
      market_issues: journal.marketIssues || null,
      memo: journal.memo || null,
      is_public: journal.isPublic || false,
      updated_at: new Date().toISOString()
    };

    console.log('Supabase에 저장할 일지 데이터:', journalData);

    const { data, error } = await supabase
      .from('investment_journals')
      .upsert(journalData, { 
        onConflict: 'user_id,date',
        ignoreDuplicates: false 
      })
      .select('id')
      .single();

    if (error) {
      logError('Supabase 일지 저장 실패', error);
      throw error;
    }

    console.log('Supabase 일지 저장 성공:', data);
    return data.id;
  } catch (error) {
    logError('Supabase 일지 저장 catch 블록', error);
    throw error;
  }
};

export const getInvestmentJournals = async (userId: string): Promise<InvestmentJournal[]> => {
  try {
    console.log('일지 조회 시도:', userId);
    
    const { data, error } = await supabase
      .from('investment_journals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      logError('Supabase 일지 조회 실패', error);
      throw error;
    }

    const journals = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      date: item.date,
      title: item.title,
      totalAssets: item.total_assets,
      foreignStocks: item.foreign_stocks || [],
      domesticStocks: item.domestic_stocks || [],
      cash: item.cash || { krw: 0, usd: 0 },
      cryptocurrency: item.cryptocurrency || [],
      evaluation: item.evaluation,
      trades: item.trades,
      psychologyCheck: item.psychology_check || { fearGreedIndex: 50, creditConcern: false },
      bullMarketChecklist: item.bull_market_checklist || [],
      bearMarketChecklist: item.bear_market_checklist || [],
      marketIssues: item.market_issues,
      memo: item.memo,
      isPublic: item.is_public,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    console.log('Supabase 일지 조회 성공:', journals.length, '개');
    return journals;
  } catch (error) {
    logError('Supabase 일지 조회 catch 블록', error);
    throw error;
  }
};