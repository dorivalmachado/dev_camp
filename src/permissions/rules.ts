import { or, rule } from "graphql-shield";
import { IContext } from "../interfaces/context.interface";
import { authUserService, retrieveUserById } from "../services/users.service";
import "dotenv/config"
import { Document } from "mongoose";
import { IUser } from "../interfaces/users/users.interface";

const isUser = rule()(async (_parent: any, _args: any, context: IContext): Promise<boolean> => {
    const {token} = context

    const id: string = await authUserService({token, secretKey: String(process.env.JWT_SECRET_KEY)})
    const userDocument: Document = await retrieveUserById(id)

    const user: IUser = userDocument.toObject()
    context.user = user

    return user.role === "user"
})

const isPublisher = rule()(async (_parent: any, _args: any, context: IContext): Promise<boolean> => {
    const {token} = context

    const id: string = await authUserService({token, secretKey: String(process.env.JWT_SECRET_KEY)})
    const userDocument: Document = await retrieveUserById(id)

    const user: IUser = userDocument.toObject()
    context.user = user

    return user.role === "publisher"
})

const isAuthenticated = or(isPublisher, isUser)

export {isAuthenticated, isPublisher, isUser}