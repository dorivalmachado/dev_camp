/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import mongoose, { Document } from 'mongoose';
import { UserDocument } from './users.model';
import { BootcampDocument, CareersTypes, bootcampsModel } from './bootcamps.model';
import getAverageCost from '../utils/getBootcampAverageCost.utils';
import validateCourseSubject from '../utils/validateCourseSubject.utils';

enum MinimumSkillTypes {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

interface CourseDocument extends Document {
  title: string
  description: string
  weeks: string
  tuition: number
  minimumSkill: MinimumSkillTypes
  scholarshipAvailable: boolean
  credits: number
  subject: CareersTypes
  bootcamp: BootcampDocument
  students: UserDocument[]
  owner: UserDocument
}

const coursesSchema = new mongoose.Schema<CourseDocument>({
  title: {
    type: String,
    trim: true,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  weeks: {
    type: String,
    required: [true, 'Weeks is required'],
  },
  tuition: {
    type: Number,
    required: [true, 'Tuition cost is required'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Minimum skill is required'],
    enum: Object.values(MinimumSkillTypes),
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  credits: {
    type: Number,
    required: [true, 'Credits is required'],
    min: [1, 'Credit must be at least 1'],
    max: [4, 'Credit can not be more than 4'],
  },
  subject: {
    type: String,
    enum: Object.values(CareersTypes),
    required: true,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamps',
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
});

coursesSchema.pre('save', async function (next, doc) {
  const validSubject = await validateCourseSubject(this.bootcamp, this.subject);

  if (!validSubject) next(new Error(`Bootcamp ${this.bootcamp} does not have ${this.subject} career`));
  next();
});

coursesSchema.pre('save', function () {
  getAverageCost(this.bootcamp);
});

coursesSchema.pre('deleteOne', { document: true, query: false }, function () {
  getAverageCost(this.bootcamp);
});

const coursesModel = mongoose.model<CourseDocument>('Course', coursesSchema);

export { CourseDocument, MinimumSkillTypes, coursesModel };
