import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository, getRepository } from 'typeorm';
import uploadConfig from '../config/uploadConfig';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

// const transactions = [];

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepositories = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepositories.getBalance();
  const transactions = await getRepository(Transaction).find();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ id });
  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const { filename } = request.file;
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute({ filename });

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
