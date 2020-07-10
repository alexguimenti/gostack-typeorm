import { uuid } from 'uuidv4';
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepositories = getCustomRepository(
      TransactionsRepository,
    );

    const balance = await transactionsRepositories.getBalance();

    const available = balance.total;

    if (type === 'outcome' && available < value) {
      throw new AppError('Not enough balance');
    }

    const categoriesRepository = getRepository(Category);
    const categories = await categoriesRepository.findOne({
      where: { title: category },
    });

    let addCategory = null;
    if (categories) {
      addCategory = categories;
    } else {
      const createCategory = new CreateCategoryService();

      addCategory = await createCategory.execute({ category });
    }
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = transactionsRepository.create({
      id: uuid(),
      title,
      value,
      type,
      category_id: addCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
