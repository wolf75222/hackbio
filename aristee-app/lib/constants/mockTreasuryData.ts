import { TreasuryData } from '@/lib/types/treasury';

export const mockTreasuryData: TreasuryData = {
  balance: {
    label: 'Balance de Trésorerie',
    value: '67 450.00€',
    change: 28.5,
    changeLabel: '+28.5%',
  },
  expectedIncome: {
    label: 'Encaissements Prévus sur le Mois',
    value: '42 380.00€',
    change: -5.0,
    changeLabel: '-5.00%',
  },
  expectedExpenses: {
    label: 'Décaissements Prévus sur le Mois',
    value: '38 920.00€',
    change: -28.5,
    changeLabel: '-28.5%',
  },
  vatRecoverable: {
    label: 'TVA Récupérable en mai ci',
    value: '2 340.00€',
    change: -2.5,
    changeLabel: '-2.5%',
  },
  freeCashFlow: {
    label: 'Free Cash-flow',
    value: '8 760.00€',
    change: 28.5,
    changeLabel: '+28.5%',
  },
  monthlyData: [
    { month: 'Janv-25', encaissements: 8500, decaissements: 6200, tresorerie: 8300 },
    { month: 'Févr-25', encaissements: 12300, decaissements: 9800, tresorerie: 10200 },
    { month: 'Mars-25', encaissements: 25400, decaissements: 18200, tresorerie: 16800 },
    { month: 'Avril-25', encaissements: 21200, decaissements: 11500, tresorerie: 25100 },
    { month: 'Mai-25', encaissements: 35800, decaissements: 6800, tresorerie: 52600 },
    { month: 'Juin-25', encaissements: 14200, decaissements: 9500, tresorerie: 56100 },
    { month: 'Juil-25', encaissements: 28900, decaissements: 5200, tresorerie: 78400 },
    { month: 'Août-25', encaissements: 10800, decaissements: 11200, tresorerie: 76800 },
    { month: 'Sept-25', encaissements: 38600, decaissements: 14500, tresorerie: 99100 },
    { month: 'Oct-25', encaissements: 26800, decaissements: 15200, tresorerie: 109200 },
    { month: 'Nov-25', encaissements: 18900, decaissements: 11800, tresorerie: 114800 },
    { month: 'Déc-25', encaissements: 9200, decaissements: 7500, tresorerie: 115200 },
  ],
  securityCushion: {
    amount: 15000,
    warning:
      'Le coussin de sécurité de 15 000 € de trésorerie est entamé et votre trésorerie risque fortement de passer dans le rouge en raison de vos prochains débits et des faibles entrées. Adapter vos règlements fournisseurs risque de ne pas suffire et vous devrez probablement faire appel à un micro-financement.',
  },
};
