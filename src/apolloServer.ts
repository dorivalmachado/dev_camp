import {ApolloServer} from "@apollo/server"
import {makeExecutableSchema} from "@graphql-tools/schema"
import { GraphQLSchema } from "graphql"
import {loadFilesSync} from "@graphql-tools/load-files"
import { applyMiddleware } from "graphql-middleware"
import {permissions} from "./permissions"

const typesArray = loadFilesSync("**/*", {extensions: [".graphql"]})
const resolversArray = loadFilesSync("**/*", {extensions: [".resolvers.ts"]})


const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs: typesArray,
    resolvers: resolversArray
})

const server = new ApolloServer({
    schema: applyMiddleware(
        schema,
        permissions,
    )
})

export default server