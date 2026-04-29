export interface BalanceParts {
  value: string;
  unit: '원';
}

export function formatBalanceParts(amount: number): BalanceParts {
  return { value: amount.toLocaleString('ko-KR'), unit: '원' };
}
