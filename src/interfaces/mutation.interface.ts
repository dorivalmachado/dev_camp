import { IUser } from "./users.interface"

type IMutationAddNewUser = Pick<IUser, "name" | "email" | "role" | "password">

type IMutationLogin = Pick<IUser,  "email" | "password">

type IMutationForgotPassword = Pick<IUser, "email">

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
    IMutationUpdatePassword
}