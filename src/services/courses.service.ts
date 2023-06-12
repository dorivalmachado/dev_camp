import { IMutationAddNewCourse, IMutationUpdateCourse, IQueryCourses } from '../interfaces/coursesQuery.interface';
import { coursesModel } from '../models/courses.model';
import { usersModel } from '../models/users.model';
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

const deleteCourseService = async (id: string, userId: string) => {
  const courseDoc = await coursesModel.findById(id);
  if (!courseDoc) throw new Error('Course not found');

  if (!courseDoc.owner._id.equals(userId)) throw new Error('Permission denied');

  const course = await coursesModel.findOneAndDelete({ _id: id });

  return course;
};

const enroll = async (userId: string, courseId: string) => {
  const user = await usersModel.findById(userId);
  if (!user) throw new Error('User not found');

  const course = await coursesModel.findById(courseId);

  const isEnrolled = course?.students.some(
    (student) => user._id.equals(student._id),
  );

  if (isEnrolled) throw new Error('User is already enrolled');

  const courseUpdated = await coursesModel.findOneAndUpdate(
    { _id: courseId },
    { $push: { students: user } },
    { new: true },
  );

  return courseUpdated;
};

const disenroll = async (userId: string, courseId: string) => {
  const user = await usersModel.findById(userId);
  if (!user) throw new Error('User not found');

  const course = await coursesModel.findById(courseId);

  const isEnrolled = course?.students.some(
    (student) => user._id.equals(student._id),
  );

  if (!isEnrolled) throw new Error('User is not enrolled');

  const courseUpdated = await coursesModel.findOneAndUpdate(
    { _id: courseId },
    { $pull: { students: { $eq: user._id } } },
    { new: true },
  );

  return courseUpdated;
};

export {
  createCourseService,
  retireveAllCoursesService,
  retrieveCourseById,
  retrieveCoursesByBootcampId,
  updateCourseService,
  deleteCourseService,
  enroll,
  disenroll,
};
