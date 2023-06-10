import { Document } from 'mongoose';
import { bootcampsModel } from '../models/bootcamps.model';
import { IMutationUpdateBootcamp } from '../interfaces/bootcampsQuery.interface';

const retrieveAllBootcampsService = async ({
  limit = 10,
  page = 1,
}:{limit?: number, page?: number}): Promise<Document[]> => {
  if (limit < 0 || page < 0) throw new Error('Limit and page mst be greater than 0');
  const skip: number = (page - 1) * limit;
  const bootcamps: Document[] = await bootcampsModel.find({}, null, { limit, skip });

  return bootcamps;
};

const createBootcampService = async (userId: string, {
  name,
  description,
  website,
  phone,
  email,
  address,
  careers,
}:{
            name: string,
            description: string,
            website: string,
            phone: string,
            email: string,
            address: string,
            careers: string[],
            housing?: boolean,
            jobAssistance?: boolean,
            jobGuarantee?: boolean,
            acceptGi?: boolean
        }): Promise<Document> => {
  const bootCampFromUser: Document | null = await bootcampsModel.findOne({ user: userId });
  if (bootCampFromUser) throw new Error('Each publisher can own only one bootcamp');

  const bootcamp: Document = await bootcampsModel.create({
    name,
    description,
    website,
    phone,
    email,
    address,
    careers,
    user: userId,
  });

  return bootcamp;
};

const retrieveBootcampById = async (id: string) => {
  const bootcamp: Document | null = await bootcampsModel.findById(id);
  if (!bootcamp) throw new Error('Bootcamp not found');

  return bootcamp;
};

const updateBootcampService = async (userId: string, payload: IMutationUpdateBootcamp) => {
  const bootcamp = await bootcampsModel.findById(payload.id);
  if (!bootcamp) throw new Error('Bootcamp not found');

  if (!bootcamp.user._id.equals(userId)) throw new Error('Permission denied');

  Object.keys(payload).forEach((key: string) => {
    const input: any = payload;
    if (input[key] === null) {
      bootcamp.set(key, undefined);
    } else if (input[key]) {
      bootcamp.set(key, input[key]);
    }
  });

  await bootcamp.save();
  return bootcamp;
};

export {
  retrieveAllBootcampsService,
  createBootcampService,
  retrieveBootcampById,
  updateBootcampService,
};