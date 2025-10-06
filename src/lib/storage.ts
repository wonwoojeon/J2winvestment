import { InvestmentJournal, ChecklistItem } from '@/types/investment';

const JOURNALS_KEY = 'investment-journals';
const CHECKLISTS_KEY = 'investment-checklists';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getJournals = (): InvestmentJournal[] => {
  try {
    const stored = localStorage.getItem(JOURNALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load journals:', error);
    return [];
  }
};

export const saveJournal = (journal: InvestmentJournal): void => {
  try {
    const journals = getJournals();
    const newJournal = { ...journal, id: journal.id || generateId() };
    journals.unshift(newJournal);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  } catch (error) {
    console.error('Failed to save journal:', error);
  }
};

export const updateJournal = (updatedJournal: InvestmentJournal): void => {
  try {
    const journals = getJournals();
    const index = journals.findIndex(j => j.id === updatedJournal.id);
    if (index !== -1) {
      journals[index] = updatedJournal;
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    }
  } catch (error) {
    console.error('Failed to update journal:', error);
  }
};

export const deleteJournal = (journalId: string): void => {
  try {
    const journals = getJournals();
    const filteredJournals = journals.filter(j => j.id !== journalId);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(filteredJournals));
  } catch (error) {
    console.error('Failed to delete journal:', error);
  }
};

export const getDefaultChecklists = () => {
  try {
    const stored = localStorage.getItem(CHECKLISTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load checklists:', error);
  }

  // Default checklists - 사용자 최신 요청 기준으로 변경
  return {
    bullMarket: [
      '내매매를 누군가에게 알려주고싶은가?',
      '주식얘기가 나오면 답답해서 한소리하고싶은가',
      '내입술의 주식관련된 매매의 정당성을 가르치고 싶은가?',
      '과도한 자신감을 일으키는 호르몬의변화가 느껴지는가?',
      '교만과오만',
      '시장의 대중을 무시하는가?',
      '일반적인 직장인들이 불쌍해 보이는가?',
      '현금을 가지고있는게 답답하고 어리석어보이는가?',
      '커보였던금액이 아무것도 아닌것같고 내가 낸 수익률료 비교가 되는가?'
    ],
    bearMarket: [
      '주식장을 쳐다도 보기싫은가?',
      '똑똑한척 하면서 전에는 없었던 부정적인 전망을 내놓는 전문가들에게 대중이 집중이 되는가?',
      '이전의 고점과 현재의 손실을 계산 하고싶은가?',
      '호르몬의 변화가 일어나 공감능력이 올라갔는가?',
      '낙담했는가?',
      '직장인들이 부러운가?',
      '현금이 너무나 귀하고 지금이라도 얼마정도를 더 챙겨야한다는 불안감이 엄습했는가?',
      '작아보였던 금액이 너무나 소중하고 돈에 관련해서 얘기가나오면 스트레스가 받는가?',
      '억울한가?'
    ]
  };
};

export const saveChecklists = (checklists: { bullMarket: string[]; bearMarket: string[] }): void => {
  try {
    localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(checklists));
  } catch (error) {
    console.error('Failed to save checklists:', error);
  }
};