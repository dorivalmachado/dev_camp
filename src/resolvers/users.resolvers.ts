import { IContext } from "../interfaces/context.interface";
import { IMutationAddNewUser, IMutationForgotPassword, IMutationLogin, IMutationResetPassword } from "../interfaces/mutation.interface";
import { createUserService, forgotPasswordService, loginUserService, resetPasswordService, retrieveAllUsersService, retrieveUserById } from "../services/users.service";
import "dotenv/config"

const Query = {
    users: retrieveAllUsersService,
    user: (_parent: any, _args: any, context: IContext) => retrieveUserById(context.user!._id)
}

const Mutation = {
    addNewUser: (_parent: any, args: IMutationAddNewUser) => createUserService(
        args.name,
        args.email,
        args.role,
        args.password
    ),
    loginUser: (_parent: any, args: IMutationLogin) => loginUserService(args.email, args.password),
    forgotPassword: (_parent: any, args: IMutationForgotPassword) => forgotPasswordService(args.email),
    resetPassword: (_parent: any, args: IMutationResetPassword) => resetPasswordService(args.email, args.newPassword, args.resetPasswordToken),
}

export {Query, Mutation}