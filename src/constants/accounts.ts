export interface AccountScheme {
  code: string;
  name: string;
  category: 'Savings' | 'Term Deposit' | 'Special' | 'Social Security';
}

export const POSTAL_ACCOUNT_SCHEMES: AccountScheme[] = [
  { code: 'SB', name: 'Post Office Savings Account (SB)', category: 'Savings' },
  { code: 'RD', name: '5-Year Post Office Recurring Deposit (RD)', category: 'Savings' },
  { code: 'TD-1Y', name: '1-Year Post Office Time Deposit (TD)', category: 'Term Deposit' },
  { code: 'TD-2Y', name: '2-Year Post Office Time Deposit (TD)', category: 'Term Deposit' },
  { code: 'TD-3Y', name: '3-Year Post Office Time Deposit (TD)', category: 'Term Deposit' },
  { code: 'TD-5Y', name: '5-Year Post Office Time Deposit (TD)', category: 'Term Deposit' },
  { code: 'MIS', name: 'Monthly Income Scheme (MIS)', category: 'Savings' },
  { code: 'SCSS', name: 'Senior Citizen Savings Scheme (SCSS)', category: 'Special' },
  { code: 'PPF', name: 'Public Provident Fund (PPF)', category: 'Special' },
  { code: 'SSA', name: 'Sukanya Samriddhi Account (SSA)', category: 'Social Security' },
  { code: 'KVP', name: 'Kisan Vikas Patra (KVP)', category: 'Special' },
  { code: 'NSC', name: 'National Savings Certificates (NSC)', category: 'Special' },
  { code: 'MSSC', name: 'Mahila Samman Savings Certificate (MSSC)', category: 'Special' },
  { code: 'Other', name: 'Other Departmental Account', category: 'Savings' },
];

export const POSTAL_ACCOUNT_TYPE_OPTIONS = POSTAL_ACCOUNT_SCHEMES.map((scheme) => ({
  value: scheme.code,
  label: `${scheme.code} - ${scheme.name}`,
  code: scheme.code,
  name: scheme.name,
  category: scheme.category,
}));
