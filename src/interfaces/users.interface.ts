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

interface IMutationAddNewUser {
    name: string
    email: string
    role: string
    password: string
}

export {IUser, IMutationAddNewUser}