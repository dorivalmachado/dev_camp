import { IContext } from "../interfaces/context.interface";
import { IMutationAddNewUser, IMutationForgotPassword, IMutationLogin, IMutationResetPassword, IMutationUpdatePassword, IMutationUpdateUser } from "../interfaces/users/usersQuery.interface";
import { confirmEmailService, createUserService, deleteUserService, loginUserService, resetPasswordService, retrieveAllUsersService, retrieveUserById, sendTokenService, updatePasswordService, updateUserService } from "../services/users.service";
import "dotenv/config"

const Query = {
    users: retrieveAllUsersService,
    user: (_parent: any, _args: any, context: IContext) => retrieveUserById(context.user!._id)
}

const Mutation = {
    addNewUser: (_parent: any, args: IMutationAddNewUser) => createUserService(args),
    loginUser: (_parent: any, args: IMutationLogin) => loginUserService(args),
    forgotPassword: (_parent: any, args: IMutationForgotPassword) => sendTokenService(args.email, "Reset password"),
    resetPassword: (_parent: any, args: IMutationResetPassword) => resetPasswordService(args),
    updatePassword: (
        _parent: any,
        args: IMutationUpdatePassword,
        context: IContext
    ) => updatePasswordService(context.user!.email, args),
    updateUser: (
        _parent: any,
        args: IMutationUpdateUser,
        context: IContext
    ) => updateUserService(context.user?._id!, args),
    deleteUser: (_parent: any, _args: any, context: IContext) => deleteUserService(context.user?._id!),
    sendConfirmEmailToken: (_parent: any, _args: any, context: IContext) => sendTokenService(context.user?.email!, "Confirm email"),
    confirmEmail: (_parent: any, args: {confirmEmailToken: string}, context: IContext) => confirmEmailService(context.user?.email!, args.confirmEmailToken),
}

export {Query, Mutation}