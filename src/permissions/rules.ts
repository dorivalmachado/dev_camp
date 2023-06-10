import { or, rule } from 'graphql-shield';
import { IContext } from '../interfaces/context.interface';
import { authUserService, retrieveUserById } from '../services/users.service';
import 'dotenv/config';
import { RoleTypes } from '../models/users.model';

const isUser = rule()(async (_parent: any, _args: any, context: IContext): Promise<boolean> => {
  const { token } = context;

  const id: string = await authUserService({
    token,
    secretKey: String(process.env.JWT_SECRET_KEY),
  });
  const user = await retrieveUserById(id);

  context.user = user;

  return user.role === RoleTypes.USER;
});

const isPublisher = rule()(async (
  _parent: any,
  _args: any,
  context: IContext,
): Promise<boolean> => {
  const { token } = context;

  const id: string = await authUserService({
    token,
    secretKey: String(process.env.JWT_SECRET_KEY),
  });
  const user = await retrieveUserById(id);

  context.user = user;

  return user.role === RoleTypes.PUBLISHER;
});

const isAuthenticated = or(isPublisher, isUser);

export { isAuthenticated, isPublisher, isUser };
