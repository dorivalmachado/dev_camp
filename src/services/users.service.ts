import { IUser } from "../interfaces/users.interface";
import { Document } from "mongoose";
import usersModel from "../schemas/users.schema";
import { compare, genSalt, hash } from "bcryptjs";
import "dotenv/config"
import { VerifyErrors, sign, verify } from "jsonwebtoken";
import {sendEmail} from "../utils/sendEmail.utils"

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

const retrieveUserById = async (id: string): Promise<Document> => {
    const user: Document | null = await usersModel.findById(id)
    if(!user) throw new Error("User not found")

    return user
}

const forgotPasswordService = async (email: string): Promise<{[key: string]: string}> => {
    const userDocument: Document | null = await usersModel.findOne({email})
    if(!userDocument) throw new Error("User not found")

    const user: IUser = userDocument.toObject()
    
    const resetPasswordToken = Math.floor(Math.random() * 9999).toString().padStart(4, "0")
    const salt = await genSalt(10)
    user.resetPasswordToken = await hash(resetPasswordToken, salt)!
    
    const expirationTime = new Date()
    expirationTime.setHours(expirationTime.getHours() + 1)
    user.resetPasswordExpire = expirationTime

    const message = `Use this token to reset your password: \n\n ${resetPasswordToken}` 
    try{
        await sendEmail({
            email,
            subject: "Reset password token",
            message
        })
    } catch(err){
        throw new Error("Missing SMTP credentials")
    }

    await usersModel.findOneAndUpdate(
        {email},
        {
            resetPasswordExpire: user.resetPasswordExpire,
            resetPasswordToken: user.resetPasswordToken
        }
    )

    return {message: "Reset password token sent by email"}
    
}

const resetPasswordService = async (email: string, newPassword: string, resetPasswordToken: string): Promise<{[key: string]: string}> => {
    const userDocument: Document | null = await usersModel.findOne({email})
    if(!userDocument) throw new Error("User not found")
    
    const user: IUser = userDocument.toObject()
    if(!user.resetPasswordToken) throw new Error("Invalid reset password token")

    const tokensMatch: boolean = await compare(resetPasswordToken, user.resetPasswordToken)
    if(!tokensMatch) throw new Error("Invalid reset password token")

    if(!user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
        throw new Error("Reset password token expired")
    }
    

    const salt = await genSalt(10)
    const hashPassword: string = await hash(newPassword, salt)

    await usersModel.findOneAndUpdate(
        {email},
        {
            password: hashPassword,
            resetPasswordExpire: null,
            resetPasswordToken: null
        }
    )

    return {message: "Password updated"}
}

const updatePasswordService = async (email: string, newPassword: string, password: string): Promise<{[key: string]: string}> => {
    const salt = await genSalt(10)
    const hashPassword: string = await hash(newPassword, salt)

    const userDocument: Document | null = await usersModel.findOne({email}).select("+password")
    if(!userDocument) throw new Error("Invalid credentials")
    
    const user: IUser = userDocument.toObject()
    const passwordMatch: boolean = await compare(password, user.password)
    if(!passwordMatch) throw new Error("Invalid credentials")

    await usersModel.findOneAndUpdate({email}, {password: hashPassword})

    return {message: "Password updated"}
}

export {
    createUserService,
    retrieveAllUsersService,
    loginUserService,
    authUserService,
    retrieveUserById,
    forgotPasswordService,
    resetPasswordService,
    updatePasswordService,
}