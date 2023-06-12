import { IContext } from '../interfaces/context.interface';
import { IMutationAddNewCourse, IQueryCourses } from '../interfaces/coursesQuery.interface';
import { retrieveBootcampById } from '../services/bootcamps.service';
import { createCourseService, retireveAllCoursesService, retrieveCourseById, retrieveCoursesByBootcampId } from '../services/courses.service';
import { retrieveUserById } from '../services/users.service';

const Query = {
  courses: (_parent: any, args: IQueryCourses) => retireveAllCoursesService(args),
  course: (_parent: any, args: {id: string}) => retrieveCourseById(args.id),
  coursesByBootcamp: (_parent: any, args: {id: string}) => retrieveCoursesByBootcampId(args.id),
};

const Course = {
  bootcamp: ({ bootcamp }: {bootcamp: string}) => retrieveBootcampById(bootcamp),
  owner: ({ owner }: {owner: string}) => retrieveUserById(owner),
  students: (
    { students }: {students: string[]},
  ) => students.map((student) => retrieveUserById(student)),
};

const Mutation = {
  addNewCourse: (
    _parent: any,
    args: IMutationAddNewCourse,
    context: IContext,
  ) => createCourseService(context.user?._id, args),
};

export { Query, Mutation, Course };
