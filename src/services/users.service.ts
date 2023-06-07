import { IUser } from "../interfaces/users.interface";
import { Document } from "mongoose";
import usersModel from "../schemas/users.schema";

const createUserService = async (
    name: string,
    email: string,
    role: string,
    password: string
):Promise<Document>  => {
    const user: Document = await usersModel.create({
        name,
        email,
        role,
        password,
    })

    return user
}

const retrieveAllUsersService = async (): Promise<Document[]> => {
    const users: Document[] = await usersModel.find({})
    return users
}

export {createUserService, retrieveAllUsersService}