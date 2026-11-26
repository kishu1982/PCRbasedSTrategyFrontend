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
  pcrBullishStartLevel: number; // default 1.2
  pcrBearishStartLevel: number; // default 0.8
  strikesAroundAtm: number; // 0 = all strikes
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
  underlying: {
    exchange: string;
    token: string;
    ltp: number;
    spotLtp?: number | null;
    source?: "SPOT" | "SYNTHETIC";
  };
  totalCallOi: number;
  totalPutOi: number;
  pcr: number;
  pcrBullishStartLevel: number;
  pcrBearishStartLevel: number;
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
  pcrStrikes?: {
    strikesAroundAtm: number; // 0 = all strikes
    atmStrike: number | null;
    callCount: number;
    putCount: number;
    strikes: {
      strike: number;
      ce: { tradingSymbol: string; token: string; oi: number | null } | null;
      pe: { tradingSymbol: string; token: string; oi: number | null } | null;
    }[];
  };
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

export interface KillResult {
  status: "SKIPPED" | "NOOP" | "DRY_RUN" | "EXECUTED" | "FAILED";
  reason?: string;
  configStatus: string;
  orders: {
    tradingSymbol: string;
    side: string;
    quantity: number;
    ok?: boolean;
    error?: string;
  }[];
}
