import { Employee } from './models';

describe('Employee model contracts', () => {
  it('keeps salary and currency explicitly paired', () => {
    const example: Pick<Employee, 'salaryAmount' | 'salaryCurrency'> = { salaryAmount: 125000, salaryCurrency: 'USD' };
    expect(example.salaryAmount).toBe(125000);
    expect(example.salaryCurrency).toBe('USD');
  });
});
