import { usersModel, RoleTypes } from '../../src/models/users.model';
import { createUserService } from '../../src/services/users.service';

describe('users.services', () => {
  describe('createUserService', () => {
    it('should create user', async () => {
      const input = {
        name: 'Jhon',
        email: 'jhon.doe@email.com',
        role: RoleTypes.PUBLISHER,
        password: 'password',
      };

      const user = await createUserService(input);
      expect(user?._id).toBeDefined();

      const savedUser = await usersModel.findById(user._id);
      expect(savedUser?.name).toEqual(input.name);
      expect(savedUser?.email).toEqual(input.email);
      expect(savedUser?.role).toEqual(input.role);
      expect(savedUser?.password).toBeUndefined();
    });
  });
});
