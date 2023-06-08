interface IUser {
    _id: string
    name: string
    email: string
    role: string
    password: string
    resetPasswordToken: string | null
    resetPasswordExpire: Date | null
    confirmEmailToken: string | null
    isEmailConfirmed: boolean | null
    twoFactorCode: string | null
    twoFactorCodeExpire: Date | null
    twoFactorEnable: boolean | null
}

type IMutationAddNewUser = Pick<IUser, "name" | "email" | "role" | "password">

type IMutationLogin = Pick<IUser,  "email" | "password">

export {IUser, IMutationAddNewUser, IMutationLogin}