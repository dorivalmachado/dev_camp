import { IQueryBootcamps } from "../interfaces/bootcamps/bootcampsQuery.interface"
import { retrieveAllBootcampsService } from "../services/bootcamps.service"

const Query = {
    bootcamps: (_parent: any, args: IQueryBootcamps) => retrieveAllBootcampsService(args.limit, args.page),
}

// const Mutation {}

export {Query}