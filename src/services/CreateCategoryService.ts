// import AppError from '../errors/AppError';
import { uuid } from 'uuidv4';
import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  category: string;
}

class CreateCategoryService {
  public async execute({ category }: Request): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      const newCategory = categoriesRepository.create({
        title: category,
        id: uuid(),
      });

      await categoriesRepository.save(newCategory);

      return newCategory;
    }

    return findCategory;
  }
}

export default CreateCategoryService;
