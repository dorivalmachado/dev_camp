import { UserDocument } from '../models/users.model';

export interface IContext {
  token: string
  user?: UserDocument | undefined
}
