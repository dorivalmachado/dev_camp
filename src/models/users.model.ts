import mongoose, { Document } from 'mongoose';
import { genSalt, hash } from 'bcryptjs';

interface UserDocument extends Document{
  name: string
  email: string
  role: string
  password: string
  resetPasswordToken: string | null
  resetPasswordExpire: Date | null
  confirmEmailToken: string | null
  isEmailConfirmed: boolean | null
}

const usersSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, 'Invalid email'],
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    minlength: 8,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  confirmEmailToken: String,
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
});

usersSchema.pre('save', async function () {
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

usersSchema.post('save', { errorHandler: true }, (error: any, _, next) => {
  if (error.code === 11000 && error.name === 'MongoServerError') {
    next(new Error('User validation failed: email: Email already in use'));
  } else {
    next(error);
  }
});

const usersModel = mongoose.model<UserDocument>('User', usersSchema);

export { usersModel, UserDocument };
