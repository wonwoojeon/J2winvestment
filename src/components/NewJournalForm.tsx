import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface NewJournalFormProps {
  onSave: () => void;
}

function NewJournalForm({ onSave }: NewJournalFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    total_assets: 0,
    evaluation: 0,
    foreign_stocks: {},
    domestic_stocks: {},
    cash: {},
    cryptocurrency: {},
    trades: '',
    psychology_check: {},
    bull_market_checklist: [],
    bear_market_checklist: [],
    market_issues: '',
    memo: '',
    is_public: false,
  });

  // 업데이트된 상승장 체크리스트 - 사용자 최신 요청 기준으로 변경
  const bullDefaults = [
    { text: '내매매를 누군가에게 알려주고싶은가?', checked: false },
    { text: '주식얘기가 나오면 답답해서 한소리하고싶은가', checked: false },
    { text: '내입술의 주식관련된 매매의 정당성을 가르치고 싶은가?', checked: false },
    { text: '과도한 자신감을 일으키는 호르몬의변화가 느껴지는가?', checked: false },
    { text: '교만과오만', checked: false },
    { text: '시장의 대중을 무시하는가?', checked: false },
    { text: '일반적인 직장인들이 불쌍해 보이는가?', checked: false },
    { text: '현금을 가지고있는게 답답하고 어리석어보이는가?', checked: false },
    { text: '커보였던금액이 아무것도 아닌것같고 내가 낸 수익률료 비교가 되는가?', checked: false },
  ];

  // 업데이트된 하락장 체크리스트 - 사용자 최신 요청 기준으로 변경
  const bearDefaults = [
    { text: '주식장을 쳐다도 보기싫은가?', checked: false },
    { text: '똑똑한척 하면서 전에는 없었던 부정적인 전망을 내놓는 전문가들에게 대중이 집중이 되는가?', checked: false },
    { text: '이전의 고점과 현재의 손실을 계산 하고싶은가?', checked: false },
    { text: '호르몬의 변화가 일어나 공감능력이 올라갔는가?', checked: false },
    { text: '낙담했는가?', checked: false },
    { text: '직장인들이 부러운가?', checked: false },
    { text: '현금이 너무나 귀하고 지금이라도 얼마정도를 더 챙겨야한다는 불안감이 엄습했는가?', checked: false },
    { text: '작아보였던 금액이 너무나 소중하고 돈에 관련해서 얘기가나오면 스트레스가 받는가?', checked: false },
    { text: '억울한가?', checked: false },
  ];

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      bull_market_checklist: bullDefaults, 
      bear_market_checklist: bearDefaults 
    }));
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalAssets = () => {
    let total = 0;
    // 실제 자산 합산 로직 (foreign_stocks 등 JSONB 필드 합산)
    // total += Object.values(formData.foreign_stocks).reduce((sum, val) => sum + Number(val || 0), 0);
    // total += Object.values(formData.domestic_stocks).reduce((sum, val) => sum + Number(val || 0), 0);
    // total += Object.values(formData.cash).reduce((sum, val) => sum + Number(val || 0), 0);
    // total += Object.values(formData.cryptocurrency).reduce((sum, val) => sum + Number(val || 0), 0);
    
    setFormData(prev => ({ ...prev, total_assets: Math.floor(total) }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      // BIGINT 안전 처리 - 소수점 제거
      const safeFormData = {
        ...formData,
        user_id: user.id,
        total_assets: Math.floor(Number(formData.total_assets) || 0),
        evaluation: Math.floor(Number(formData.evaluation) || 0),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('investment_journals').insert(safeFormData);
      if (error) throw error;
      
      console.log('일지 저장 성공');
      alert('일지가 성공적으로 저장되었습니다!');
      onSave();
    } catch (error) {
      console.error('일지 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleChecklistChange = (type: 'bull_market_checklist' | 'bear_market_checklist', index: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item: any, i: number) => 
        i === index ? { ...item, checked } : item
      )
    }));
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">새 투자일지 작성</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-2">날짜</label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={e => handleInputChange('date', e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">제목</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => handleInputChange('title', e.target.value)}
            placeholder="일지 제목"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">총 자산 (원)</label>
          <input 
            type="number" 
            value={formData.total_assets} 
            onChange={e => handleInputChange('total_assets', Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">평가손익 (원)</label>
          <input 
            type="number" 
            value={formData.evaluation} 
            onChange={e => handleInputChange('evaluation', Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-white mb-2">메모</label>
        <textarea 
          value={formData.memo} 
          onChange={e => handleInputChange('memo', e.target.value)}
          placeholder="오늘의 투자 소감이나 중요 사건을 기록하세요"
          rows={3}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>

      {/* 상승장 체크리스트 */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🐂 상승장 심리 체크리스트</h3>
        <div className="space-y-3">
          {formData.bull_market_checklist.map((item: any, index: number) => (
            <label key={index} className="flex items-start space-x-3 text-white cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={e => handleChecklistChange('bull_market_checklist', index, e.target.checked)}
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
      </div>

      {/* 하락장 체크리스트 */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🐻 하락장 심리 체크리스트</h3>
        <div className="space-y-3">
          {formData.bear_market_checklist.map((item: any, index: number) => (
            <label key={index} className="flex items-start space-x-3 text-white cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={e => handleChecklistChange('bear_market_checklist', index, e.target.checked)}
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
      </div>

      <div className="flex gap-4">
        <button 
          onClick={calculateTotalAssets} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          총 자산 자동 계산
        </button>
        <button 
          onClick={handleSave} 
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors font-semibold"
        >
          💾 저장
        </button>
      </div>

      <div className="text-xs text-gray-400 text-center">
        💡 체크리스트는 투자 심리 상태를 객관적으로 파악하는 데 도움이 됩니다.
      </div>
    </div>
  );
}

export default NewJournalForm;