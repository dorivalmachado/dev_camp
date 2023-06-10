import { IUser } from "../interfaces/users/users.interface";
import { Document } from "mongoose";
import usersModel from "../models/users.model";
import { compare, genSalt, hash } from "bcryptjs";
import "dotenv/config"
import { VerifyErrors, sign, verify } from "jsonwebtoken";
import {sendEmail} from "../utils/sendEmail.utils"

const createUserService = async ({
        name,
        email,
        role,
        password,
    }: {
        name: string,
        email: string,
        role: string,
        password: string
    }
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

const loginUserService = async ({
        email,
        password,
    }:{
        email: string,
        password: string
    }): Promise<{token: string}> => {
    const userDoc: Document<unknown, {}, IUser> | null = await usersModel.findOne({email}).select("+password")

    if(!userDoc) throw new Error("Invalid email or password")

    const user: IUser = userDoc.toObject()
    
    const isPasswordCorrect = await compare(password, user.password)
    if(!isPasswordCorrect) throw new Error("Invalid email or password")

    const token = sign({id: user._id}, String(process.env.JWT_SECRET_KEY), {expiresIn: String(process.env.JWT_EXPIRATION)})

    return {token}
}

const authUserService = async ({
        token,
        secretKey,
    }:{
        token: string,
        secretKey: string
    }): Promise<string> => {
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

const sendTokenService = async (
    email: string,
    subject: "Reset password" | "Confirm email"
    ): Promise<{message: string}> => {
        const userDocument: Document | null = await usersModel.findOne({email})
        if(!userDocument) throw new Error("User not found")

        const token = Math.floor(Math.random() * 9999).toString().padStart(4, "0")
        const salt = await genSalt(10)
        const hashedToken = await hash(token, salt)!
        
        const expirationTime = new Date()
        expirationTime.setHours(expirationTime.getHours() + 1)
        
        
        const message = `This is your ${subject.toLowerCase()} token: \n\n ${token}` 
        try{
            await sendEmail({
                email,
                subject: `${subject} token`,
                message
            })
        } catch(err){
            throw new Error("Missing SMTP credentials")
        }
        
        const user: IUser = userDocument.toObject()

        if(subject.includes("password")) {
            user.resetPasswordToken = hashedToken
            user.resetPasswordExpire = expirationTime
            
            await usersModel.findOneAndUpdate(
                {email},
                {
                    resetPasswordExpire: user.resetPasswordExpire,
                    resetPasswordToken: user.resetPasswordToken
                }
            )
        }
        
        if(subject.includes("email")) {
            user.confirmEmailToken = hashedToken
            
            await usersModel.findOneAndUpdate(
                {email},
                {
                    confirmEmailToken: user.confirmEmailToken
                }
            )
        }

        return {message: `${subject} token sent by email`}
    
}

const resetPasswordService = async ({
        email,
        newPassword,
        resetPasswordToken,
    }:{
        email: string,
        newPassword: string,
        resetPasswordToken: string
    }): Promise<{message: string}> => {
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

const confirmEmailService = async (email: string, confirmEmailToken: string): Promise<{message: string}> => {
    const userDocument: Document | null = await usersModel.findOne({email})
    if(!userDocument) throw new Error("User not found")
    
    const user: IUser = userDocument.toObject()
    if(!user.confirmEmailToken) throw new Error("Confirm email token not found")

    const tokensMatch: boolean = await compare(confirmEmailToken, user.confirmEmailToken)
    if(!tokensMatch) throw new Error("Invalid token")

    await usersModel.findOneAndUpdate(
        {email},
        {
            isEmailConfirmed: true
        }
    )

    return {message: "Email confirmed"}
}

const updatePasswordService = async (email: string,
    {
        newPassword,
        password,
    }:{
        
        newPassword: string,
        password: string
    }): Promise<{message: string}> => {
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

const updateUserService = async (id: string,
    {
        name,
        email,
    }:{
        name?: string,
        email?: string,
    }):Promise<Document>  => {
        const payload: {
            [key: string]: string | undefined
        } = {name, email}
        Object.keys(payload).forEach((key: string) => payload[key] === undefined && delete payload[key])
        
        const userDocument: Document | null = await usersModel.findOneAndUpdate({_id: id}, payload, {new: true})
        if(!userDocument) throw new Error("Invalid credentials")
        
        return userDocument
}

const deleteUserService = async (id: string):Promise<Document>  => {
    const userDocument: Document | null = await usersModel.findOneAndDelete({_id: id})
    if(!userDocument) throw new Error("Invalid credentials")
    
    return userDocument
}

export {
    createUserService,
    retrieveAllUsersService,
    loginUserService,
    authUserService,
    retrieveUserById,
    sendTokenService,
    resetPasswordService,
    updatePasswordService,
    updateUserService,
    deleteUserService,
    confirmEmailService,
}