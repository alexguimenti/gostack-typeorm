import { EntityRepository, Repository, getRepository } from 'typeorm';

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
    const transactionRepository = getRepository(Transaction);
    const transactions = await transactionRepository.find();

    let totalOutcome = 0;
    let totalIncome = 0;
    if (transactions.length > 0) {
      const foundIncome = transactions.find(
        transaction => transaction.type === 'income',
      );
      if (foundIncome) {
        const incomeTransactions = transactions.filter(
          transaction => transaction.type === 'income',
        );

        const incomeValues = incomeTransactions.map(
          transaction => transaction.value,
        );

        totalIncome = incomeValues.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
        );
      }

      const foundOutcome = transactions.find(
        transaction => transaction.type === 'outcome',
      );

      if (foundOutcome) {
        const outcomeTransactions = transactions.filter(
          transaction => transaction.type === 'outcome',
        );

        const outcomeValues = outcomeTransactions.map(
          transaction => transaction.value,
        );

        totalOutcome = outcomeValues.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
        );
      }

      const total = totalIncome - totalOutcome;

      const balance = {
        income: totalIncome,
        outcome: totalOutcome,
        total,
      };

      return balance;
    }
    const balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };
    return balance;
  }
}

export default TransactionsRepository;
