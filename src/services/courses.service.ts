import { IMutationAddNewCourse, IMutationUpdateCourse, IQueryCourses } from '../interfaces/coursesQuery.interface';
import { coursesModel } from '../models/courses.model';
import { retrieveBootcampById } from './bootcamps.service';

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

const retrieveCourseById = async (id: string) => {
  const course = await coursesModel.findById(id);
  if (!course) throw new Error('Course not found');

  return course;
};

const retrieveCoursesByBootcampId = async (id: string) => {
  await retrieveBootcampById(id);
  const courses = await coursesModel.find({ bootcamp: id });

  return courses;
};

const updateCourseService = async (userId: string, payload: IMutationUpdateCourse) => {
  const course = await coursesModel.findById(payload.id);
  if (!course) throw new Error('Course not found');

  if (!course.owner._id.equals(userId)) throw new Error('Permission denied');

  Object.keys(payload).forEach((key: string) => {
    const input: any = payload;
    if (input[key] === null) {
      course.set(key, undefined);
    } else if (input[key]) {
      course.set(key, input[key]);
    }
  });

  await course.save();
  return course;
};

export {
  createCourseService,
  retireveAllCoursesService,
  retrieveCourseById,
  retrieveCoursesByBootcampId,
  updateCourseService,
};
