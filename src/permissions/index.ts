import { shield } from "graphql-shield";
import { isAuthenticated } from "./rules";

const permissions = shield({
    Query: {
        user: isAuthenticated
    }
})

export {permissions}