import { compare, genSalt, hash } from 'bcryptjs';
import { usersModel, RoleTypes } from '../../src/models/users.model';
import {
  authUserService,
  confirmEmailService,
  createUserService,
  deleteUserService,
  loginUserService,
  resetPasswordService,
  retrieveAllUsersService,
  retrieveUserById,
  updatePasswordService,
  updateUserService,
} from '../../src/services/users.service';

describe('users.services', () => {
  const input = {
    name: 'Jhon',
    email: 'jhon.doe@email.com',
    role: RoleTypes.PUBLISHER,
    password: 'password',
  };
  describe('createUserService', () => {
    it('should create user', async () => {
      const user = await createUserService(input);
      expect(user?._id).toBeDefined();

      const savedUser = await usersModel.findById(user._id);
      expect(savedUser?.name).toEqual(input.name);
      expect(savedUser?.email).toEqual(input.email);
      expect(savedUser?.role).toEqual(input.role);
      expect(savedUser?.password).toBeUndefined();
    });

    it(
      'should throw an error if password length is less than 8 digits',
      async () => {
        const inputError = {
          name: 'Jhon',
          email: 'jhon.doe@email.com',
          role: RoleTypes.PUBLISHER,
          password: 'p',
        };

        await expect(createUserService(inputError)).rejects.toThrow(
          `User validation failed: password: Path \`password\` (\`${inputError.password}\`) is shorter than the minimum allowed length (8).`,
        );
      },
    );

    it('should throw an error if email is not unique', async () => {
      await createUserService(input);

      await expect(createUserService(input)).rejects.toThrow(
        'User validation failed: email: Email already in use',
      );
    });

    it('should throw an error if an invalid email is passed', async () => {
      const inputError = {
        name: 'Jhon',
        email: 'jhon.doe.com',
        role: RoleTypes.PUBLISHER,
        password: 'password',
      };

      await expect(createUserService(inputError)).rejects.toThrow(
        'User validation failed: email: Invalid email',
      );
    });

    it('should throw an error if name is not passed', async () => {
      const inputError = {
        name: '',
        email: 'jhon.doe@email.com',
        role: RoleTypes.PUBLISHER,
        password: 'password',
      };

      await expect(createUserService(inputError)).rejects.toThrow(
        'User validation failed: name: Name is required',
      );
    });

    it('should throw an error if password is not passed', async () => {
      const inputError = {
        name: 'Jhon',
        email: 'jhon.doe@email.com',
        role: RoleTypes.PUBLISHER,
        password: '',
      };

      await expect(createUserService(inputError)).rejects.toThrow(
        'User validation failed: password: Password is required',
      );
    });
  });

  describe('retrieveAllUsersService', () => {
    it('should return an array with all users', async () => {
      const user = await usersModel.create(input);
      const users = await retrieveAllUsersService();
      expect(users).toHaveLength(1);
      expect(users[0]._id.equals(user._id)).toBe(true);
    });
  });

  describe('loginUserService', () => {
    it('should return a token when login', async () => {
      await usersModel.create(input);
      const token = await loginUserService({
        email: input.email,
        password: input.password,
      });

      expect(token).toHaveProperty('token');
    });

    it('should throw an error when email is wrong', async () => {
      await usersModel.create(input);

      await expect(loginUserService({
        email: 'wrong@email.com',
        password: input.password,
      })).rejects.toThrow('Invalid email or password');
    });

    it('should throw an error when password is wrong', async () => {
      await usersModel.create(input);

      await expect(loginUserService({
        email: input.email,
        password: 'wrong_password',
      })).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('authUserService', () => {
    it('should return a valid user id', async () => {
      const user = await usersModel.create(input);
      const token = await loginUserService({
        email: input.email,
        password: input.password,
      });

      const id = await authUserService({
        ...token,
        secretKey: String(process.env.JWT_SECRET_KEY),
      });

      expect(user._id.equals(id)).toBe(true);
    });

    it('should throw an error when token is invalid', async () => {
      const token = 'invalid token';

      await expect(authUserService({
        token,
        secretKey: String(process.env.JWT_SECRET_KEY),
      })).rejects.toThrow('jwt malformed');
    });
  });

  describe('retrieveUserById', () => {
    it('should return a valid user', async () => {
      const user = await usersModel.create(input);
      const retrievedUser = await retrieveUserById(user._id);

      expect(retrievedUser._id.equals(user._id)).toBe(true);
    });

    it('should throw an error if user does not exist', async () => {
      const invalidId = '1484b71a08c88a3bd158d000';
      await expect(retrieveUserById(invalidId)).rejects.toThrow('User not found');
    });
  });

  describe('resetPasswordService', () => {
    it('should reset password', async () => {
      const user = await usersModel.create(input);

      const resetPasswordToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(resetPasswordToken, salt);

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);

      user.set('resetPasswordExpire', expirationTime);
      user.set('resetPasswordToken', hashedToken);
      await user.save();

      const newPassword = 'newPassword';
      const { email } = input;

      const payload = {
        email,
        newPassword,
        resetPasswordToken,
      };
      await resetPasswordService(payload);

      const foundUser = await usersModel.findOne({ email }).select('+password');
      const matchPasswords = await compare(newPassword, foundUser!.password);

      expect(matchPasswords).toBe(true);
      expect(foundUser!.resetPasswordExpire!).toBeNull();
      expect(foundUser!.resetPasswordToken!).toBeNull();
    });

    it('should throw an error if user does not exist', async () => {
      const resetPasswordToken = '1111';
      const newPassword = 'newPassword';
      const email = 'wrong@email.com';

      const payload = {
        email,
        newPassword,
        resetPasswordToken,
      };
      await expect(resetPasswordService(payload)).rejects.toThrow('User not found');
    });

    it('should throw an error if there is no resetPasswordToken', async () => {
      await usersModel.create(input);

      const resetPasswordToken = '1111';
      const newPassword = 'newPassword';
      const { email } = input;

      const payload = {
        email,
        newPassword,
        resetPasswordToken,
      };

      await expect(resetPasswordService(payload)).rejects.toThrow('Invalid reset password token');
    });

    it('should throw an error if resetPasswordToken is wrong', async () => {
      const user = await usersModel.create(input);

      const resetPasswordToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash('0000', salt);

      user.set('resetPasswordToken', hashedToken);
      await user.save();

      const newPassword = 'newPassword';
      const { email } = input;

      const payload = {
        email,
        newPassword,
        resetPasswordToken,
      };

      await expect(resetPasswordService(payload)).rejects.toThrow('Invalid reset password token');
    });

    it('should throw an error if token is expired', async () => {
      const user = await usersModel.create(input);

      const resetPasswordToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(resetPasswordToken, salt);

      const expirationTime = new Date();

      user.set('resetPasswordExpire', expirationTime);
      user.set('resetPasswordToken', hashedToken);
      await user.save();

      const newPassword = 'newPassword';
      const { email } = input;

      const payload = {
        email,
        newPassword,
        resetPasswordToken,
      };

      await expect(resetPasswordService(payload)).rejects.toThrow('Reset password token expired');
    });
  });

  describe('confirmEmailService', () => {
    it('should confirm email', async () => {
      const user = await usersModel.create(input);

      const confirmEmailToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash(confirmEmailToken, salt);

      user.set('confirmEmailToken', hashedToken);
      await user.save();

      const { email } = input;

      await confirmEmailService(email, confirmEmailToken);

      const foundUser = await usersModel.findOne({ email });

      expect(foundUser!.isEmailConfirmed!).toBe(true);
    });

    it('should throw an error if user does not exist', async () => {
      const confirmEmailToken = '1111';
      const email = 'wrong@email.com';

      await expect(confirmEmailService(email, confirmEmailToken)).rejects.toThrow('User not found');
    });

    it('should throw an error if there is no confirmEmailToken', async () => {
      await usersModel.create(input);

      const confirmEmailToken = '1111';
      const { email } = input;

      await expect(confirmEmailService(email, confirmEmailToken)).rejects.toThrow('Confirm email token not found');
    });

    it('should throw an error if confirmEmailToken is wrong', async () => {
      const user = await usersModel.create(input);

      const confirmEmailToken = '1111';
      const salt = await genSalt(10);
      const hashedToken = await hash('0000', salt);

      user.set('confirmEmailToken', hashedToken);
      await user.save();

      const { email } = input;

      await expect(confirmEmailService(email, confirmEmailToken)).rejects.toThrow('Invalid token');
    });
  });

  describe('updatePasswordService', () => {
    it('should update password', async () => {
      await usersModel.create(input);

      const { email } = input;
      const { password } = input;
      const newPassword = 'newPassword';

      const payload = { password, newPassword };

      await updatePasswordService(email, payload);

      const user = await usersModel.findOne({ email }).select('+password');

      const matchPassword = await compare(password, user!.password);
      const matchNewPassword = await compare(newPassword, user!.password);

      expect(matchNewPassword).toBe(true);
      expect(matchPassword).toBe(false);
    });

    it('should throw an error if user does not exist', async () => {
      const email = 'wrong@email.com';
      const { password } = input;
      const newPassword = 'newPassword';

      const payload = { password, newPassword };

      await expect(updatePasswordService(email, payload)).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error if password is wrong', async () => {
      await usersModel.create(input);

      const { email } = input;
      const password = 'wrong-password';
      const newPassword = 'newPassword';

      const payload = { password, newPassword };

      await expect(updatePasswordService(email, payload)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('updateUserService', () => {
    it('should update user', async () => {
      const user = await usersModel.create(input);

      const name = 'Johnny';
      const updatedUser = await updateUserService(user._id, { name });

      expect(updatedUser._id.equals(user._id)).toBe(true);
      expect(updatedUser.name).not.toBe(input.name);
      expect(updatedUser.name).toBe(name);
      expect(updatedUser.email).toBe(input.email);
    });

    it('should throw an error if id is invalid', async () => {
      const invalidId = '1484b71a08c88a3bd158d000';
      const name = 'Johnny';

      await expect(updateUserService(invalidId, { name })).rejects.toThrow('User not found');
    });
  });

  describe('deleteUserService', () => {
    it('should delete user', async () => {
      const user = await usersModel.create(input);
      const id = user._id;

      await deleteUserService(id);

      const foundUser = await usersModel.findById(id);

      expect(foundUser).toBeNull();
    });

    it('should throw an error if id is invalid', async () => {
      const invalidId = '1484b71a08c88a3bd158d000';

      await expect(deleteUserService(invalidId)).rejects.toThrow('User not found');
    });
  });
});
