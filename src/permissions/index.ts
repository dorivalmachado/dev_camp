import { shield } from "graphql-shield";
import { isAuthenticated } from "./rules";

const permissions = shield({
    Query: {
        user: isAuthenticated
    },
    Mutation: {
        updatePassword: isAuthenticated,
        updateUser: isAuthenticated,
    }
})

export {permissions}