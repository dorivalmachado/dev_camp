import { IMutationAddNewBootcamp, IMutationUpdateBootcamp, IQueryBootcamps } from '../interfaces/bootcampsQuery.interface';
import { IContext } from '../interfaces/context.interface';
import {
  createBootcampService,
  deleteBootcampService,
  retrieveAllBootcampsService,
  retrieveBootcampById,
  updateBootcampService,
} from '../services/bootcamps.service';
import { retrieveUserById } from '../services/users.service';

const Query = {
  bootcamps: (_parent: any, args: IQueryBootcamps) => retrieveAllBootcampsService(args),
  bootcamp: (_parent: any, args: {id: string}) => retrieveBootcampById(args.id),
};

const Bootcamp = {
  user: ({ user }: {user: string}) => retrieveUserById(user),
};

const Mutation = {
  addNewBootcamp: (
    _parent: any,
    args: IMutationAddNewBootcamp,
    context: IContext,
  ) => createBootcampService(context.user?._id, args),
  updateBootcamp: (
    _parent: any,
    args: IMutationUpdateBootcamp,
    context: IContext,
  ) => updateBootcampService(context.user?._id, args),
  deleteBootcamp: (
    _parent: any,
    args: {id: string},
    context: IContext,
  ) => deleteBootcampService(args.id, context.user?.id),
};

export { Query, Mutation, Bootcamp };
