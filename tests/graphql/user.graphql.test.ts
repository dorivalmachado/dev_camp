import usersModel, { RoleTypes } from '../../src/schemas/users.schema';
import { buildApolloServer } from '../setup';

const ADD_USER = `mutation AddNewUser(
  $name: String!,
  $email: String!, 
  $role: String!,
  $password: String!
) {
  addNewUser(name: $name, email: $email, role: $role, password: $password) {
    id
    name
    email
    role
  }
}`;

describe('user.graphql', () => {
  let testServer: any;
  beforeEach(() => {
    testServer = buildApolloServer();
  });

  describe('addNewUser', () => {
    it('should create user', async () => {
      const input = {
        name: 'Jhon',
        email: 'jhon.doe@email.com',
        role: RoleTypes.PUBLISHER,
        password: 'password',
      };

      const res = await testServer.executeOperation({
        query: ADD_USER,
        variables: input,
      });
      const id = res?.body?.singleResult?.data?.addNewUser?.id;
      expect(id).toBeDefined();
      const savedUser = await usersModel.findById(id);
      expect(savedUser?.name).toEqual(input.name);
      expect(savedUser?.email).toEqual(input.email);
      expect(savedUser?.role).toEqual(input.role);
      expect(savedUser?.password).toBeUndefined();
    });

    it('should return error for an invalid payload', async () => {
      const input = {
        name: 'Jhon',
        email: 'jhon.doe@email.com',
        role: RoleTypes.PUBLISHER,
        password: 'p',
      };

      const res = await testServer.executeOperation({
        query: ADD_USER,
        variables: input,
      });
      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toEqual(`User validation failed: password: Path \`password\` (\`${input.password}\`) is shorter than the minimum allowed length (8).`);
    });
  });
});
