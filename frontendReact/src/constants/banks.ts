export const CHILEAN_BANKS = [
  'Banco de Chile',
  'Banco Estado',
  'Banco Santander',
  'Banco BCI',
  'Banco Scotiabank',
  'Banco Itaú',
  'Banco Security',
  'Banco Falabella',
  'Banco Ripley',
  'Banco Consorcio',
  'Banco BICE',
  'Banco Internacional',
  'Banco Paris',
  'Banco Coopeuch',
  'Banco BBVA',
] as const;

export const ACCOUNT_TYPES = [
  'Cuenta Vista',
  'Cuenta Corriente',
  'Cuenta de Ahorro',
  'Cuenta RUT',
] as const;

export type BankName = typeof CHILEAN_BANKS[number];
export type AccountType = typeof ACCOUNT_TYPES[number];
