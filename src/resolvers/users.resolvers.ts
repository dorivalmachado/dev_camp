import { IMutationAddNewUser, IMutationLogin } from "../interfaces/users.interface";
import { createUserService, loginUserService, retrieveAllUsersService } from "../services/users.service";

const Query = {
    users: retrieveAllUsersService
}

const Mutation = {
    addNewUser: (_: any, args: IMutationAddNewUser) => createUserService(
        args.name,
        args.email,
        args.role,
        args.password
    ),
    loginUser: (_: any, args: IMutationLogin) => loginUserService(args.email, args.password)
}

export {Query, Mutation}