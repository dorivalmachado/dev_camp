import { IUser } from "./users.interface"

type IMutationAddNewUser = Pick<IUser, "name" | "email" | "role" | "password">

type IMutationLogin = Pick<IUser,  "email" | "password">

type IMutationForgotPassword = Pick<IUser,  "email">

export {IMutationAddNewUser, IMutationLogin, IMutationForgotPassword}