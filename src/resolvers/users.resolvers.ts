import { IMutationAddNewUser } from "../interfaces/users.interface";
import { createUserService } from "../services/users.service";

const Mutation = {
    addNewUser: (_: any, args: IMutationAddNewUser) => createUserService(
        args.name,
        args.email,
        args.role,
        args.password
    )
}

export {Mutation}