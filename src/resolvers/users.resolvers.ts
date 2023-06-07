import { IMutationAddNewUser } from "../interfaces/users.interface";
import { createUserService, retrieveAllUsersService } from "../services/users.service";

const Query = {
    users: retrieveAllUsersService
}

const Mutation = {
    addNewUser: (_: any, args: IMutationAddNewUser) => createUserService(
        args.name,
        args.email,
        args.role,
        args.password
    )
}

export {Query, Mutation}