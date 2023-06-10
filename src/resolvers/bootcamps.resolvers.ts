import { IMutationAddNewBootcamp, IQueryBootcamps } from "../interfaces/bootcamps/bootcampsQuery.interface"
import { IContext } from "../interfaces/context.interface"
import { createBootcampService, retrieveAllBootcampsService, retrieveBootcampById } from "../services/bootcamps.service"

const Query = {
    bootcamps: (_parent: any, args: IQueryBootcamps) => retrieveAllBootcampsService(args),
    bootcamp: (_parent: any, args: {id: string}) => retrieveBootcampById(args.id)
}

const Mutation = {
    addNewBootcamp: (_parent: any, args: IMutationAddNewBootcamp, context: IContext) => createBootcampService(context.user?._id!, args),
}

export {Query, Mutation}