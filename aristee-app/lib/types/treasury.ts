export interface TreasuryMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export interface MonthlyData {
  month: string;
  encaissements: number;
  decaissements: number;
  tresorerie: number;
}

export interface TreasuryData {
  balance: TreasuryMetric;
  expectedIncome: TreasuryMetric;
  expectedExpenses: TreasuryMetric;
  vatRecoverable: TreasuryMetric;
  freeCashFlow: TreasuryMetric;
  monthlyData: MonthlyData[];
  securityCushion: {
    amount: number;
    warning: string;
  };
}
