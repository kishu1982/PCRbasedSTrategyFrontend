export type Status = "ACTIVE" | "INACTIVE";
export type Side = "BUY" | "SELL";

export interface ConfigInput {
  contractName: string;
  pcrExchange: string;
  pcrExpiry: string;
  tradeExchange: string;
  tradeInstrumentType: string;
  tradeContractName: string;
  tradeExpiry: string;
  timeframeMinutes: number;
  lotsPerTrade: number;
  status: Status;
  pcrStartLevel: number;
  side: Side;
  underlyingExchange: string;
  underlyingToken: string;
  // only returned by the API / editable via PATCH
  pcrStep?: number;
  productType?: string;
}

export interface PcrConfig extends ConfigInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpenPosition {
  exchange: string;
  token: string;
  tradingSymbol: string;
  optType: string;
  lotSize: number;
  netQty: number;
  netLots: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
}

export interface LiveStrategy {
  configId: string;
  contractName: string;
  pcrExchange: string;
  pcrExpiry: string;
  strategyActive: boolean;
  side: string;
  timeframeMinutes: number;
  underlying: { exchange: string; token: string; ltp: number };
  totalCallOi: number;
  totalPutOi: number;
  pcr: number;
  pcrStartLevel: number;
  pcrStep: number;
  lots: {
    direction: string;
    pcrLots: number;
    lotsPerTrade: number;
    targetLots: number;
  };
  optionType: string;
  contractToTrade: {
    exchange: string;
    token: string;
    symbol: string;
    tradingSymbol: string;
    expiry: string;
    instrument: string;
    optType: string;
    strikePrice: number;
    lotSize: number;
  } | null;
  contractReason: string | null;
  openPositions: OpenPosition[];
  totalOpenLots: number;
  positionsOk: boolean;
  feed: { totalStrikes: number; received: number; coverage: number };
  lastExecution: null | {
    at: string;
    pcr: number;
    targetLots: number;
    heldLots: number;
    status: string;
    plan?: {
      tradingSymbol: string;
      side: string;
      quantity: number;
      reason: string;
    }[];
    results?: {
      tradingSymbol: string;
      side: string;
      quantity: number;
      price?: number;
      ok: boolean;
      orderNo?: string;
      reason: string;
    }[];
    error?: string;
  };
  updatedAt: string;
}
