import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const transactions = await this.find();

    const balance = transactions.reduce(
      (acumulator, currentValue) => {
        return currentValue.type === 'income'
          ? {
              income: acumulator.income + Number(currentValue.value),
              outcome: acumulator.outcome,
              total: acumulator.total + Number(currentValue.value),
            }
          : {
              income: acumulator.income,
              outcome: acumulator.outcome + Number(currentValue.value),
              total: acumulator.total - Number(currentValue.value),
            };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
