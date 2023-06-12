import slugify from 'slugify';
import { RoleTypes, usersModel } from '../../src/models/users.model';
import {
  createBootcampService,
  deleteBootcampService,
  retrieveAllBootcampsService,
  retrieveBootcampById,
  updateBootcampService,
} from '../../src/services/bootcamps.service';
import { CareersTypes, bootcampsModel } from '../../src/models/bootcamps.model';

describe('users.services', () => {
  const inputPublisher1 = {
    name: 'Jhon',
    email: 'jhon.doe@email.com',
    role: RoleTypes.PUBLISHER,
    password: 'password',
  };

  const inputPublisher2 = {
    name: 'Jhonny',
    email: 'jhonny.doe@email.com',
    role: RoleTypes.PUBLISHER,
    password: 'password',
  };

  const input = {
    name: 'John Bootcamp',
    description: 'Awesome bootcamp',
    website: 'http://www.john-bootcamp.com',
    phone: '4035651022',
    email: 'john-bootcamp@bootcamp.com',
    address: '520 3 Ave SW, Calgary, AB T2P 0R3',
    careers: [CareersTypes.WEB, CareersTypes.UI_UX],
    housing: true,
  };

  describe('createBootcampService', () => {
    it('should create a new bootcamp', async () => {
      const user = await usersModel.create(inputPublisher1);
      const bootcamp = await createBootcampService(user._id, input);

      const matchUser = user._id.equals(bootcamp.user);
      const matchCareers = bootcamp.careers.every((elem) => input.careers.includes(elem));

      expect(bootcamp.name).toBe(input.name);
      expect(bootcamp.slug).toBe(slugify(input.name, { lower: true }));
      expect(bootcamp.description).toBe(input.description);
      expect(bootcamp.website).toBe(input.website);
      expect(bootcamp.phone).toBe(input.phone);
      expect(bootcamp.email).toBe(input.email);
      expect(bootcamp.housing).toBe(true);
      expect(bootcamp.jobAssistance).toBe(false);
      expect(bootcamp.jobGuarantee).toBe(false);
      expect(bootcamp.acceptGi).toBe(false);
      expect(matchUser).toBe(true);
      expect(matchCareers).toBe(true);
      expect(bootcamp.location.coordinates).toHaveLength(2);
      expect(bootcamp.location.type).toBeTruthy();
      expect(bootcamp.location.formattedAddress).toBeTruthy();
      expect(bootcamp.location.street).toBeTruthy();
      expect(bootcamp.location.city).toBeTruthy();
      expect(bootcamp.location.state).toBeTruthy();
      expect(bootcamp.location.zipcode).toBeTruthy();
      expect(bootcamp.location.country).toBeTruthy();
    });

    it('should throw an error when name already exist', async () => {
      const user = await usersModel.create(inputPublisher1);
      const user2 = await usersModel.create(inputPublisher2);
      await createBootcampService(user._id, input);

      await expect(createBootcampService(user2._id, input)).rejects.toThrow(
        'Bootcamp validation failed: name: Name already in use',
      );
    });

    it('should throw an error when name is not passed', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = { ...input, name: '' };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: name: Name is required',
      );
    });

    it('should throw an error when name is too long', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        name: `This name is too long. It must have up to 50 characters.
        You must try another name. These are some examples:
        Bootcamp, My Bootcamp, Awesome Bootcamp, The Best Bootcamp
        `,
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: name: Name can have up to 50 characters',
      );
    });

    it('should throw an error when description is not passed', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        description: '',
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: description: Description is required',
      );
    });

    it('should throw an error when name is too long', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        description: `Kp5w57QTyGuzB05DmJvoH7Xmn5w1Uk0QRIydgdoBxItoKyPRfemhmO
        DqwxdZ9t58dv8Fbh4epAoxeOxU2NfHEO7aAVUVGpuJLIcIAXnIrJkjcKonVCsgbYGJ0TXLv0nVvn
        hdxiMxBEMZXQHGNWIuwiW4OPiaoyAr1HlD9E3yimB8CtoD3abtxfi7cJNA0dS3gmoJIGlJCMxrS9
        YQT7G0WpGUV7YbiFEX0nPmH3iKNw5N5CB8X94H2kitU6CaQq1q8Ft3GZqsNEjIyTEMgJ0hxDqmK6
        mvtriQNPPRe09bDbDxgoBQ3AHJd95mJqV8AVGLbSftPevvYSYhe7m3syrilLV9eHmPivTdLApSqf
        QHAMe25kNzxPcXaVAl55Sxk2qG0N3rXACUq4ln2rjjnvcyxk6TCPtEy3ymtqqlLtQuMVdl1vQSu2
        tD1YqUCIBS17Ro33aybegVMFfmLxiGhiZv1khQg60TJesEH8grMS5fC9gP8le3mLpWNV7RspbsK6
        `,
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: description: Description can have up to 500 characters',
      );
    });

    it('should throw an error when website is not valid', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        website: 'www.not-valid.com',
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: website: Use a valid URL with HTTP or HTTPS',
      );
    });

    it('should throw an error when phone is not valid', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        phone: '123 456 7890',
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: phone: Add a valid phone number with only numbers',
      );
    });

    it('should throw an error when email is not valid', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        email: 'not-valid@email',
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: email: Invalid email',
      );
    });

    it('should throw an error when address is not passed', async () => {
      const user = await usersModel.create(inputPublisher1);
      const newInput = {
        ...input,
        address: '',
      };

      await expect(createBootcampService(user._id, newInput)).rejects.toThrow(
        'Bootcamp validation failed: address: Address is required',
      );
    });

    it('should throw an error when user create a second bootcamp', async () => {
      const user = await usersModel.create(inputPublisher1);
      await createBootcampService(user._id, input);

      await expect(createBootcampService(user._id, input)).rejects.toThrow(
        'Each publisher can own only one bootcamp',
      );
    });
  });

  describe('retrieveAllBootcampsService', () => {
    it('should retrieve a list with bootcamps', async () => {
      const user = await usersModel.create(inputPublisher1);
      const bootcamp = await createBootcampService(user._id, input);

      const bootcamps = await retrieveAllBootcampsService({});
      const bootcampsMatch = bootcamp._id.equals(bootcamps[0]._id);

      expect(bootcamps).toHaveLength(1);
      expect(bootcampsMatch).toBe(true);
    });

    it('should throw an error when limit value is invalid', async () => {
      const user = await usersModel.create(inputPublisher1);
      await createBootcampService(user._id, input);

      await expect(retrieveAllBootcampsService({ limit: 0 })).rejects.toThrow(
        'Limit and page must be greater than 0',
      );
    });

    it('should throw an error when page value is invalid', async () => {
      const user = await usersModel.create(inputPublisher1);
      await createBootcampService(user._id, input);

      await expect(retrieveAllBootcampsService({ page: 0 })).rejects.toThrow(
        'Limit and page must be greater than 0',
      );
    });
  });

  describe('retrieveBootcampById', () => {
    it('should retrieve bootcamp', async () => {
      const user = await usersModel.create(inputPublisher1);
      const bootcamp = await createBootcampService(user._id, input);

      const bootcampRetrieved = await retrieveBootcampById(bootcamp._id);
      const bootcampMatch = bootcamp._id.equals(bootcampRetrieved._id);

      expect(bootcampMatch).toBe(true);
      expect(bootcampRetrieved.name).toBe(input.name);
    });

    it('should throw an erro if bootcamp does not exist', async () => {
      const bootcampId = '1484b71a08c88a3bd158d000';

      await expect(retrieveBootcampById(bootcampId)).rejects.toThrow(
        'Bootcamp not found',
      );
    });
  });
  describe('updateBootcampService', () => {
    it('should update the bootcamp', async () => {
      const user = await usersModel.create(inputPublisher1);
      const bootcamp = await createBootcampService(user._id, input);

      const payload = {
        id: bootcamp._id,
        name: 'One Bootcamp',
        jobAssistance: true,
      };

      const bootcampUpdated = await updateBootcampService(user._id, payload);

      expect(bootcampUpdated.name).toBe(payload.name);
      expect(bootcampUpdated.jobAssistance).toBe(payload.jobAssistance);
    });

    it('should throw an erro if bootcamp does not exist', async () => {
      const user = await usersModel.create(inputPublisher1);
      const payload = {
        id: '1484b71a08c88a3bd158d000',
        name: 'One Bootcamp',
        jobAssistance: true,
      };

      await expect(updateBootcampService(user._id, payload)).rejects.toThrow(
        'Bootcamp not found',
      );
    });

    it('should throw an erro if user is not the bootcamp owner', async () => {
      const user = await usersModel.create(inputPublisher1);
      const user2 = await usersModel.create(inputPublisher2);
      const bootcamp = await createBootcampService(user._id, input);

      const payload = {
        id: bootcamp._id,
        name: 'One Bootcamp',
        jobAssistance: true,
      };

      await expect(updateBootcampService(user2._id, payload)).rejects.toThrow(
        'Permission denied',
      );
    });
  });
  describe('deleteBootcampService', () => {
    it('should delete the bootcamp', async () => {
      const user = await usersModel.create(inputPublisher1);
      const bootcamp = await createBootcampService(user._id, input);
      const id = bootcamp._id;

      const bootcampDeleted = await deleteBootcampService(id, user._id);
      const bootcampNotFound = await bootcampsModel.findById(id);

      expect(bootcampDeleted!.name).toBe(input.name);
      expect(bootcampNotFound).toBeNull();
    });

    it('should throw an erro if bootcamp does not exist', async () => {
      const user = await usersModel.create(inputPublisher1);
      const id = '1484b71a08c88a3bd158d000';

      await expect(deleteBootcampService(id, user._id)).rejects.toThrow(
        'Bootcamp not found',
      );
    });

    it('should throw an erro if user is not the bootcamp owner', async () => {
      const user = await usersModel.create(inputPublisher1);
      const user2 = await usersModel.create(inputPublisher2);
      const bootcamp = await createBootcampService(user._id, input);
      const id = bootcamp._id;

      await expect(deleteBootcampService(id, user2._id)).rejects.toThrow(
        'Permission denied',
      );
    });
  });
});
