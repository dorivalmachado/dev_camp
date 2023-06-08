import { IUser } from "../interfaces/users.interface";
import { Document } from "mongoose";
import usersModel from "../schemas/users.schema";
import { compare } from "bcryptjs";
import "dotenv/config"
import { VerifyErrors, sign, verify } from "jsonwebtoken";

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

const loginUserService = async (email: string, password: string): Promise<{[key: string]: string}> => {
    const userDoc: Document<unknown, {}, IUser> | null = await usersModel.findOne({email}).select("+password")

    if(!userDoc) throw new Error("Invalid email or password")

    const user: IUser = userDoc.toObject()
    
    const isPasswordCorrect = await compare(password, user.password)
    if(!isPasswordCorrect) throw new Error("Invalid email or password")

    const token = sign({id: user._id}, String(process.env.JWT_SECRET_KEY), {expiresIn: String(process.env.JWT_EXPIRATION)})

    return {token}
}

const authUserService = async (token: string, secretKey: string): Promise<string> => {
    const idOrError: any = await verify(token, secretKey, async (error, decoded: any): Promise< VerifyErrors | string> => {
        if(error) return error
        return decoded.id
    })

    if(idOrError instanceof Error) throw new Error(idOrError.message)
    return idOrError
}

const getUserRoleService = async (id: string): Promise<string> => {
    const user: Document | null = await usersModel.findById(id)

    if(!user) throw new Error("User not found")
    return user.toObject().role
}

const retrieveUserById = async (id: string): Promise<Document> => {
    const user: Document | null = await usersModel.findById(id)
    if(!user) throw new Error("User not found")

    return user
}

export {createUserService, retrieveAllUsersService, loginUserService, authUserService, getUserRoleService, retrieveUserById}