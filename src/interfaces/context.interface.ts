import { IUser } from "./users.interface"

interface IContext {
    token: string
    user?: IUser | undefined
}

export {IContext}