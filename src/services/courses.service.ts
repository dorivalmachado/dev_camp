import { IMutationAddNewCourse } from '../interfaces/coursesQuery.interface';
import { coursesModel } from '../models/courses.model';

const createCourseService = async (userId: string, payload: IMutationAddNewCourse) => {
  const newPayload = { ...payload, owner: userId };
  const course = await coursesModel.create(newPayload);

  return course;
};

export { createCourseService };
