import mongoose from "mongoose";
import { IUser } from "../interfaces/users.interface";
import { genSalt, hash } from "bcryptjs";

const usersSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Invalid email"]
    },
    role: {
        type: String,
        enum: ["user", "publisher"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minlength: 8
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    confirmEmailToken: String,
    isEmailConfirmed: {
        type: Boolean,
        default: false
    },
    twoFactorCode: String,
    twoFactorCodeExpire: Date,
    twoFactorEnable: {
        type: Boolean,
        default: false
    },
})

usersSchema.pre("save", async function ()  {
    const salt = await genSalt(10)
    this.password = await hash(this.password, salt)
})

const usersModel = mongoose.model<IUser>("User", usersSchema)

export default usersModel