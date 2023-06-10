import { IMutationAddNewBootcamp, IQueryBootcamps } from "../interfaces/bootcamps/bootcampsQuery.interface"
import { createBootcampService, retrieveAllBootcampsService } from "../services/bootcamps.service"

const Query = {
    bootcamps: (_parent: any, args: IQueryBootcamps) => retrieveAllBootcampsService(args),
}

const Mutation = {
    addNewBootcamp: (_parent: any, args: IMutationAddNewBootcamp) => createBootcampService(args),

}

export {Query, Mutation}