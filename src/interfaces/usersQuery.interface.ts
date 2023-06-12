import { RoleTypes } from '../models/users.model';

interface IUser {
  _id: string
  name: string
  email: string
  role: RoleTypes
  password: string
  resetPasswordToken: string | null
  resetPasswordExpire: Date | null
  confirmEmailToken: string | null
  isEmailConfirmed: boolean | null
}

type IMutationAddNewUser = Pick<IUser, 'name' | 'email' | 'role' | 'password'>

type IMutationUpdateUser = Partial<Pick<IUser, 'name' | 'email'>>

type IMutationLogin = Pick<IUser, 'email' | 'password'>

type IMutationForgotPassword = Pick<IUser, 'email'>

interface IMutationResetPassword {
    email: string
    newPassword: string
    resetPasswordToken: string
}

interface IMutationUpdatePassword {
    password: string
    newPassword: string
}

export {
  IMutationAddNewUser,
  IMutationLogin,
  IMutationForgotPassword,
  IMutationResetPassword,
  IMutationUpdatePassword,
  IMutationUpdateUser,
};
