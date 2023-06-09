import { Document } from "mongoose";
import bootcampsModel from "../models/bootcamps.model";

const retrieveAllBootcampsService = async (limit: number = 10, page: number = 1): Promise<Document[]> => {
    if(limit < 0 || page < 0) throw new Error("Limit and page mst be greater than 0")
    const skip: number = (page - 1) * limit
    const bootcamps: Document[] = await bootcampsModel.find({}, null, {limit, skip})

    return bootcamps
}

export { retrieveAllBootcampsService}