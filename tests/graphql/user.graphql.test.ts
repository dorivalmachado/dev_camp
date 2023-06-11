import { compare, genSalt, hash } from 'bcryptjs';
import { RoleTypes, usersModel } from '../../src/models/users.model';
import buildApolloServer from '../setup';

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

const LOGIN_USER = `mutation LoginUser(
  $email: String!,
  $password: String!
) {
  loginUser(email: $email, password: $password) {
    token
  }
}`;

const QUERY_USERS = `query Users {
  users {
    id
    name
    email
    role
  }
}`;

const QUERY_USER = `query User {
  user {
    id
    name
    email
    role
  }
}`;

const UPDATE_USER = `mutation UpdateUser(
  $name: String,
  $email: String, 
) {
  updateUser(name: $name, email: $email) {
    id
    name
    email
  }
}`;

const DELETE_USER = `mutation DeleteUser {
  deleteUser {
    id
    name
    email
  }
}`;

const RESET_PASSWORD = `mutation ResetPassword(
  $email: String!,
  $newPassword: String!
  $resetPasswordToken: String! 
) {
  resetPassword(email: $email, newPassword: $newPassword, resetPasswordToken: $resetPasswordToken) {
    message
  }
}`;

const UPDATE_PASSWORD = `mutation UpdatePassword(
  $password: String! 
  $newPassword: String!
) {
  updatePassword(password: $password, newPassword: $newPassword) {
    message
  }
}`;

const CONFIRM_EMAIL = `mutation ConfirmEmail(
  $confirmEmailToken: String! 
) {
  confirmEmail(confirmEmailToken: $confirmEmailToken) {
    message
  }
}`;

describe('user.graphql', () => {
  let testServer: any;
  beforeEach(() => {
    testServer = buildApolloServer();
  });

  const inputPublisher = {
    name: 'Jhon',
    email: 'jhon.doe@email.com',
    role: RoleTypes.PUBLISHER,
    password: 'password',
  };

  const inputUser = {
    name: 'Jane',
    email: 'jane.doe@email.com',
    role: RoleTypes.USER,
    password: 'mot-de-passe',
  };

  describe('addNewUser', () => {
    it('should create user', async () => {
      const res = await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });
      const id = res?.body?.singleResult?.data?.addNewUser?.id;
      expect(id).toBeDefined();
      const savedUser = await usersModel.findById(id);
      expect(savedUser?.name).toEqual(inputPublisher.name);
      expect(savedUser?.email).toEqual(inputPublisher.email);
      expect(savedUser?.role).toEqual(inputPublisher.role);
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

  describe('loginUser', () => {
    it('should return a token', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const res = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email: inputPublisher.email,
          password: inputPublisher.password,
        },
      });

      const token = res?.body?.singleResult?.data?.loginUser;

      expect(token).toHaveProperty('token');
      expect(token.token).toBeTruthy();
    });

    it('should throw an error with wrong credentials', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const res = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email: inputPublisher.email,
          password: inputUser.password,
        },
      });

      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toEqual('Invalid email or password');
    });
  });

  describe('users', () => {
    it('should return an array with all users', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputUser,
      });

      const res = await testServer.executeOperation({
        query: QUERY_USERS,
      });

      const users = res?.body?.singleResult?.data?.users;
      const [user1, user2] = users;

      expect(users).toHaveLength(2);
      expect(user1.email).toBe(inputPublisher.email);
      expect(user1).toHaveProperty('name');
      expect(user1).toHaveProperty('role');
      expect(user1.password).toBeUndefined();
      expect(user2.email).toBe(inputUser.email);
      expect(user2).toHaveProperty('name');
      expect(user2).toHaveProperty('role');
      expect(user2.password).toBeUndefined();
    });
  });

  describe('user', () => {
    it('should return logged user', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email: inputPublisher.email,
          password: inputPublisher.password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;

      const res = await testServer.executeOperation(
        { query: QUERY_USER },
        { contextValue: { token } },
      );

      const user = res?.body?.singleResult?.data?.user;

      expect(user.email).toBe(inputPublisher.email);
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('password');
    });

    it('should throw an error if user is not logged', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const res = await testServer.executeOperation(
        { query: QUERY_USER },
      );

      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toBe('Not Authorised!');
    });
  });

  describe('updateUser', () => {
    it('should update logged user', async () => {
      const resCreated = await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });
      const userCreated = resCreated?.body?.singleResult?.data?.addNewUser;

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email: inputPublisher.email,
          password: inputPublisher.password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;
      const updatedEmail = 'updated@email.com';
      const dataToUpdate = { email: updatedEmail };

      const res = await testServer.executeOperation(
        {
          query: UPDATE_USER,
          variables: dataToUpdate,
        },
        { contextValue: { token } },
      );

      const user = res?.body?.singleResult?.data?.updateUser;

      expect(user.id).toBe(userCreated.id);
      expect(user.name).toBe(inputPublisher.name);
      expect(user.email).toBe(updatedEmail);
    });

    it('should throw an error if user is not logged', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const res = await testServer.executeOperation(
        {
          query: UPDATE_USER,
          variables: { email: 'email@email.com' },
        },
      );

      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toBe('Not Authorised!');
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email: inputPublisher.email,
          password: inputPublisher.password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;

      const res = await testServer.executeOperation(
        { query: DELETE_USER },
        { contextValue: { token } },
      );

      const user = res?.body?.singleResult?.data?.deleteUser;
      const { id } = user;

      const foundUser = await usersModel.findById(id);

      expect(user.name).toBe(inputPublisher.name);
      expect(foundUser).toBeNull();
    });

    it('should throw an error if user is not logged', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const res = await testServer.executeOperation(
        { query: DELETE_USER },
      );

      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toBe('Not Authorised!');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const resetPasswordToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(resetPasswordToken, salt);

      const resetPasswordExpire = new Date();
      resetPasswordExpire.setHours(resetPasswordExpire.getHours() + 1);

      const { email, password } = inputPublisher;
      const newPassword = 'new_password';
      const variables = {
        email,
        newPassword,
        resetPasswordToken,
      };

      await usersModel.findOneAndUpdate(
        { email },
        { resetPasswordToken: hashedToken, resetPasswordExpire },
      );

      const res = await testServer.executeOperation({
        query: RESET_PASSWORD,
        variables,
      });

      const message = res?.body?.singleResult?.data?.resetPassword;

      const user = await usersModel.findOne({ email }).select('+password');
      const matchPassword = await compare(password, user?.password!);
      const matchNewPassword = await compare(newPassword, user?.password!);

      expect(message.message).toBe('Password updated');
      expect(user?.resetPasswordExpire).toBeNull();
      expect(user?.resetPasswordToken).toBeNull();
      expect(matchPassword).toBe(false);
      expect(matchNewPassword).toBe(true);
    });

    it('should throw an error if resetPasswordExpire is null', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const resetPasswordToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(resetPasswordToken, salt);

      const { email } = inputPublisher;
      const newPassword = 'new_password';
      const payload = {
        email,
        newPassword,
        resetPasswordToken,
      };

      await usersModel.findOneAndUpdate({ email }, { resetPasswordToken: hashedToken });

      const res = await testServer.executeOperation({
        query: RESET_PASSWORD,
        variables: payload,
      });

      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toBe('Reset password token expired');
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const { email, password } = inputPublisher;

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email,
          password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;

      const newPassword = 'new_password';

      const res = await testServer.executeOperation(
        {
          query: UPDATE_PASSWORD,
          variables: { password, newPassword },
        },
        { contextValue: { token } },
      );
      const message = res?.body?.singleResult?.data?.updatePassword;

      const user = await usersModel.findOne({ email }).select('+password');
      const matchPassword = await compare(password, user?.password!);
      const matchNewPassword = await compare(newPassword, user?.password!);

      expect(message.message).toBe('Password updated');
      expect(matchPassword).toBe(false);
      expect(matchNewPassword).toBe(true);
    });

    it('should throw an error if password is incorrect', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const { email, password } = inputPublisher;

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email,
          password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;

      const newPassword = 'new_password';

      const res = await testServer.executeOperation(
        {
          query: UPDATE_PASSWORD,
          variables: { password: 'wrong_password', newPassword },
        },
        { contextValue: { token } },
      );

      const error = res?.body?.singleResult?.errors[0];

      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('confirmEmailToken', () => {
    it('should confirm email', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const confirmEmailToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(confirmEmailToken, salt);

      const { email, password } = inputPublisher;

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email,
          password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;

      await usersModel.findOneAndUpdate(
        { email },
        { confirmEmailToken: hashedToken },
      );

      const res = await testServer.executeOperation(
        {
          query: CONFIRM_EMAIL,
          variables: { confirmEmailToken },
        },
        { contextValue: { token } },
      );

      const message = res?.body?.singleResult?.data?.confirmEmail;

      const user = await usersModel.findOne({ email });

      expect(message.message).toBe('Email confirmed');
      expect(user?.isEmailConfirmed).toBe(true);
    });

    it('should throw an error if confirmEmailToken is incorrect', async () => {
      await testServer.executeOperation({
        query: ADD_USER,
        variables: inputPublisher,
      });

      const confirmEmailToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(confirmEmailToken, salt);

      const { email, password } = inputPublisher;

      const resLogin = await testServer.executeOperation({
        query: LOGIN_USER,
        variables: {
          email,
          password,
        },
      });

      const token = resLogin?.body?.singleResult?.data?.loginUser?.token;

      await usersModel.findOneAndUpdate(
        { email },
        { confirmEmailToken: hashedToken },
      );

      const res = await testServer.executeOperation(
        {
          query: CONFIRM_EMAIL,
          variables: { confirmEmailToken: '1234' },
        },
        { contextValue: { token } },
      );

      const error = res?.body?.singleResult?.errors[0];
      expect(error.message).toBe('Invalid token');
    });
  });
});
