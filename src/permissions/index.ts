import { allow, shield } from 'graphql-shield';
import { isAuthenticated, isPublisher } from './rules';

const permissions = shield({
  Query: {
    user: isAuthenticated,
  },
  Mutation: {
    updatePassword: isAuthenticated,
    updateUser: isAuthenticated,
    deleteUser: isAuthenticated,
    sendConfirmEmailToken: isAuthenticated,
    confirmEmail: isAuthenticated,
    addNewBootcamp: isPublisher,
    updateBootcamp: isPublisher,
    deleteBootcamp: isPublisher,
    addNewCourse: isPublisher,
    updateCourse: isPublisher,
    deleteCourse: isPublisher,
  },
}, {
  fallbackRule: allow,
  allowExternalErrors: true,
});

export default permissions;
