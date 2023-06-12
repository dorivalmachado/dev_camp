import { IMutationAddNewCourse, IQueryCourses } from '../interfaces/coursesQuery.interface';
import { coursesModel } from '../models/courses.model';

const createCourseService = async (userId: string, payload: IMutationAddNewCourse) => {
  const newPayload = { ...payload, owner: userId };
  const course = await coursesModel.create(newPayload);

  return course;
};

const retireveAllCoursesService = async ({
  limit = 10,
  page = 1,
}: IQueryCourses) => {
  if (limit <= 0 || page <= 0) throw new Error('Limit and page must be greater than 0');
  const skip: number = (page - 1) * limit;

  const courses = await coursesModel.find({}, null, { limit, skip });

  return courses;
};

export { createCourseService, retireveAllCoursesService };
