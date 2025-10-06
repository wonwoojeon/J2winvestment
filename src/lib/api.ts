// 환율 정보를 가져오는 API 함수들
export interface ExchangeRate {
  USD_KRW: number;
  timestamp: number;
}

// 실시간 환율 정보 가져오기 (업비트 API 사용)
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
    const data = await response.json();
    
    // 업비트에서 달러-원 환율 정보를 직접 제공하지 않으므로
    // 대략적인 환율을 사용 (실제로는 더 정확한 환율 API를 사용해야 함)
    const usdKrwRate = 1320; // 기본값, 실제로는 환율 API에서 가져와야 함
    
    // 로컬 스토리지에 캐시
    const exchangeData = {
      USD_KRW: usdKrwRate,
      timestamp: Date.now()
    };
    localStorage.setItem('exchange_rate', JSON.stringify(exchangeData));
    
    return usdKrwRate;
  } catch (error) {
    console.error('환율 정보 가져오기 실패:', error);
    
    // 캐시된 환율 정보 사용
    try {
      const cached = localStorage.getItem('exchange_rate');
      if (cached) {
        const data = JSON.parse(cached);
        // 1시간 이내의 데이터만 사용
        if (Date.now() - data.timestamp < 3600000) {
          return data.USD_KRW;
        }
      }
    } catch (cacheError) {
      console.error('캐시된 환율 정보 로드 실패:', cacheError);
    }
    
    // 기본 환율 반환
    return 1320;
  }
}

// 더 정확한 환율 API (ExchangeRate-API 사용)
export async function getAccurateExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    const usdKrwRate = data.rates.KRW;
    
    // 로컬 스토리지에 캐시
    const exchangeData = {
      USD_KRW: usdKrwRate,
      timestamp: Date.now()
    };
    localStorage.setItem('exchange_rate', JSON.stringify(exchangeData));
    
    return usdKrwRate;
  } catch (error) {
    console.error('정확한 환율 정보 가져오기 실패:', error);
    return getExchangeRate(); // 폴백
  }
}

// 암호화폐 가격 정보 가져오기 (CoinGecko API 사용)
export async function getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    const symbolsQuery = symbols.map(s => s.toLowerCase()).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsQuery}&vs_currencies=usd`
    );
    const data = await response.json();
    
    const prices: Record<string, number> = {};
    symbols.forEach(symbol => {
      const lowerSymbol = symbol.toLowerCase();
      if (data[lowerSymbol] && data[lowerSymbol].usd) {
        prices[symbol] = data[lowerSymbol].usd;
      }
    });
    
    return prices;
  } catch (error) {
    console.error('암호화폐 가격 정보 가져오기 실패:', error);
    return {};
  }
}

// 주식 가격 정보 가져오기 (Alpha Vantage API - 무료 제한이 있음)
export async function getStockPrices(symbols: string[]): Promise<Record<string, number>> {
  // 실제 구현에서는 주식 API를 사용해야 하지만,
  // 무료 API의 제한으로 인해 더미 데이터 반환
  const prices: Record<string, number> = {};
  symbols.forEach(symbol => {
    // 더미 가격 (실제로는 API에서 가져와야 함)
    prices[symbol] = Math.random() * 200 + 50;
  });
  return prices;
}

// 레거시 함수들 - 기존 코드 호환성을 위해 유지
export async function fetchStockPrice(symbol: string): Promise<number> {
  try {
    // 더미 주식 가격 반환 (실제로는 주식 API 사용)
    return Math.random() * 200 + 50;
  } catch (error) {
    console.error('주식 가격 가져오기 실패:', error);
    return 0;
  }
}

// 환율 정보 가져오기 (레거시 호환)
export async function fetchExchangeRate(): Promise<number> {
  return getAccurateExchangeRate();
}

// 자산 가치 계산 함수
export function calculateAssetValue(price: number, quantity: number): number {
  return price * quantity;
}

// 공포 탐욕 지수 가져오기 (더미 데이터)
export async function fetchFearGreedIndex(): Promise<number> {
  // 실제로는 Fear & Greed Index API를 사용해야 함
  return Math.floor(Math.random() * 100);
}

// 실제 공포 탐욕 지수 가져오기 (JournalForm에서 사용)
export async function fetchRealFearGreedIndex(): Promise<number> {
  try {
    // 실제로는 CNN Fear & Greed Index API를 사용해야 함
    // 현재는 더미 데이터 반환
    return Math.floor(Math.random() * 100);
  } catch (error) {
    console.error('실제 공포 탐욕 지수 가져오기 실패:', error);
    return 50; // 기본값
  }
}

// 신용 잔고 정보 (더미 데이터)
export async function fetchCreditBalance(): Promise<number> {
  // 실제로는 증권사 API를 사용해야 함
  return Math.random() * 1000000000;
}

// M2 통화량 정보 (더미 데이터)
export async function fetchM2MoneySupply(): Promise<number> {
  // 실제로는 한국은행 API를 사용해야 함
  return Math.random() * 3000000000000;
}

// 업비트 API를 통한 실시간 암호화폐 가격 조회
export async function fetchUpbitPrice(market: string): Promise<number> {
  try {
    const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data[0].trade_price;
    }
    
    return 0;
  } catch (error) {
    console.error('업비트 가격 조회 실패:', error);
    return 0;
  }
}