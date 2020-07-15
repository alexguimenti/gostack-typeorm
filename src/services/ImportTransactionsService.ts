import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/uploadConfig';
import Category from '../models/Category';

interface RequestDTO {
  filename: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // TODO

    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      category => category.title,
    );

    const addCategoryTitle = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitle.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;

    // const filePath = path.join(uploadConfig.directory, filename);

    // const categoryRepository = getRepository(Category);
    // const transactionRepository = getRepository(Transaction);

    // const transactions: Array<TransactionInterface> = [];
    // const categories: string[] = [];

    // await new Promise(resolve => {
    //   parseCSV.on('end', resolve);
    // });

    // const existentCategories = await categoryRepository.find({
    //   where: {
    //     title: In(categories),
    //   },
    // });

    // const existentCategoriesTitle = existentCategories.map(
    //   (category: Category) => category.title,
    // );

    // const addCategoryTitles = categories
    //   .filter(category => !existentCategoriesTitle.includes(category))
    //   .filter((value, index, self) => self.indexOf(value) === index);

    // const newCategories = categoryRepository.create(
    //   addCategoryTitles.map(title => ({
    //     title,
    //   })),
    // );

    // await categoryRepository.save(newCategories);

    // const finalCategories = [...newCategories, ...existentCategories];
    // console.log(finalCategories);
    // console.log(transactions);

    // const createdTransactions = transactionRepository.create(
    //   transactions.map(transaction => ({
    //     title: transaction.title,
    //     type: transaction.type,
    //     value: transaction.value,
    //     category: finalCategories.find(
    //       category => category.title === transaction.category,
    //     ),
    //   })),
    // );

    // await transactionRepository.save(createdTransactions);

    // await fs.promises.unlink(filePath);

    // return createdTransactions;
  }
}

export default ImportTransactionsService;
