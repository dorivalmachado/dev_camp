import { Document } from "mongoose";
import bootcampsModel from "../models/bootcamps.model";

const retrieveAllBootcampsService = async ({limit = 10, page = 1}:{limit?: number, page?: number}): Promise<Document[]> => {
    if(limit < 0 || page < 0) throw new Error("Limit and page mst be greater than 0")
    const skip: number = (page - 1) * limit
    const bootcamps: Document[] = await bootcampsModel.find({}, null, {limit, skip})

    return bootcamps
}

const createBootcampService = async ({
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
        }
    ): Promise<Document> => {
        const bootcamp: Document = await bootcampsModel.create({
            name,
            description,
            website,
            phone,
            email,
            address,
            careers,
        })

        return bootcamp
    }

export { retrieveAllBootcampsService, createBootcampService}