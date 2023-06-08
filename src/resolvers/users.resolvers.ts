import { IMutationAddNewUser, IMutationLogin, IUserToken } from "../interfaces/users.interface";
import { authUserService, retrieveUserById } from "../services/users.service";
import { createUserService, loginUserService, retrieveAllUsersService } from "../services/users.service";
import "dotenv/config"

const Query = {
    users: retrieveAllUsersService,
    user: (_parent: any, _args: any, context: IUserToken) => {
        const {token} = context
        const id: string = await authUserService(token, String(process.env.JWT_SECRET_KEY))

        return await retrieveUserById(id)
    }
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