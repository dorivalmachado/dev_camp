import { IUser } from "./users/users.interface"

interface IContext {
    token: string
    user?: IUser | undefined
}

export {IContext}