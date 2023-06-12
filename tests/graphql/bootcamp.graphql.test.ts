import { bootcampsModel } from '../../src/models/bootcamps.model';
import { RoleTypes, usersModel } from '../../src/models/users.model';
import { loginUserService } from '../../src/services/users.service';
import buildApolloServer from '../setup';

const ADD_BOOTCAMP = `mutation AddNewBootcamp(
  $name: String!
  $description: String!
  $website: String!
  $phone: String!
  $email: String!
  $address: String!
  $careers: [String]!
  $housing: Boolean
  $jobAssistance: Boolean
  $jobGuarantee: Boolean
  $acceptGi: Boolean
) {
  addNewBootcamp(name: $name, description: $description, website: $website, phone: $phone, email: $email, address: $address, careers: $careers, housing: $housing, jobAssistance: $jobAssistance, jobGuarantee: $jobGuarantee, acceptGi: $acceptGi) {
    id
    name
    description
    housing
    user {
      id
    }
  }
}`;

const BOOTCAMPS = `query Bootcamps($page: Int, $limit: Int){
  bootcamps(page: $page, limit: $limit){
    id
    name
    housing
    user {
      id
    }
  }
}`;

const BOOTCAMP = `query Bootcamp($id: ID!){
  bootcamp(id: $id){
    id
    name
    user {
      id
    }
  }
}`;

const UPDATE_BOOTCAMP = `mutation UpdateBootcamp(
  $id: ID!
  $name: String
  $description: String
  $website: String
  $phone: String
  $email: String
  $address: String
  $careers: [String]
  $housing: Boolean
  $jobAssistance: Boolean
  $jobGuarantee: Boolean
  $acceptGi: Boolean
) {
  updateBootcamp(id: $id, name: $name, description: $description, website: $website, phone: $phone, email: $email, address: $address, careers: $careers, housing: $housing, jobAssistance: $jobAssistance, jobGuarantee: $jobGuarantee, acceptGi: $acceptGi) {
    id
    name
    description
    housing
    acceptGi
    user {
      id
    }
  }
}`;

const DELETE_BOOTCAMP = `mutation DeleteBootcamp($id: ID!) {
  deleteBootcamp(id: $id) {
    id
    name
    description
    housing
    acceptGi
    user {
      id
    }
  }
}`;

describe('bootcamp.graphql', () => {
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

  const inputBootcamp = {
    name: 'John Bootcamp',
    description: 'Awesome bootcamp',
    website: 'http://www.john-bootcamp.com',
    phone: '4035651022',
    email: 'john-bootcamp@bootcamp.com',
    address: '520 3 Ave SW, Calgary, AB T2P 0R3',
    careers: ['Web Development', 'UI/UX'],
    housing: true,
  };

  describe('addNewBootcamp', () => {
    it('should create a new bootcamp', async () => {
      const user = await usersModel.create(inputPublisher);
      const { email, password } = inputPublisher;
      const token = await loginUserService({ email, password });

      const res = await testServer.executeOperation(
        {
          query: ADD_BOOTCAMP,
          variables: inputBootcamp,
        },
        { contextValue: token },
      );

      const bootcamp = res?.body?.singleResult?.data?.addNewBootcamp;
      const matchUserId = user._id.equals(bootcamp.user.id);

      expect(matchUserId).toBe(true);
      expect(bootcamp.acceptGi).toBeUndefined();
      expect(bootcamp.name).toBe(inputBootcamp.name);
      expect(bootcamp.description).toBe(inputBootcamp.description);
      expect(bootcamp.housing).toBe(inputBootcamp.housing);
    });

    it('should throw an error if user is not publisher', async () => {
      await usersModel.create(inputUser);
      const { email, password } = inputUser;
      const token = await loginUserService({ email, password });

      const res = await testServer.executeOperation(
        {
          query: ADD_BOOTCAMP,
          variables: inputBootcamp,
        },
        { contextValue: token },
      );

      const error = res?.body?.singleResult?.errors[0];

      expect(error.message).toBe('Not Authorised!');
    });
  });

  describe('bootcamps', () => {
    it('should retrieve all bootcamps', async () => {
      await usersModel.create(inputPublisher);
      const { email, password } = inputPublisher;
      const token = await loginUserService({ email, password });

      await testServer.executeOperation(
        {
          query: ADD_BOOTCAMP,
          variables: inputBootcamp,
        },
        { contextValue: token },
      );
      const res = await testServer.executeOperation({ query: BOOTCAMPS });

      const bootcamps = res?.body?.singleResult?.data?.bootcamps;

      expect(bootcamps).toHaveLength(1);
      expect(bootcamps[0].acceptGi).toBeUndefined();
      expect(bootcamps[0].name).toBe(inputBootcamp.name);
      expect(bootcamps[0].housing).toBe(inputBootcamp.housing);
    });

    it('should throw an error if page is not positive', async () => {
      await usersModel.create(inputPublisher);
      const { email, password } = inputPublisher;
      const token = await loginUserService({ email, password });

      await testServer.executeOperation(
        {
          query: ADD_BOOTCAMP,
          variables: inputBootcamp,
        },
        { contextValue: token },
      );
      const res = await testServer.executeOperation({
        query: BOOTCAMPS,
        variables: { page: 0 },
      });

      const error = res?.body?.singleResult?.errors[0];

      expect(error.message).toBe('Limit and page must be greater than 0');
    });
  });

  describe('bootcamp', () => {
    it('should retrieve a bootcamp by id', async () => {
      await usersModel.create(inputPublisher);
      const { email, password } = inputPublisher;
      const token = await loginUserService({ email, password });
      const bootcampCreated = await testServer.executeOperation(
        {
          query: ADD_BOOTCAMP,
          variables: inputBootcamp,
        },
        { contextValue: token },
      );

      const id = bootcampCreated?.body?.singleResult?.data?.addNewBootcamp?.id;
      const res = await testServer.executeOperation({
        query: BOOTCAMP,
        variables: { id },
      });

      const bootcamp = res?.body?.singleResult?.data?.bootcamp;

      expect(bootcamp.id).toEqual(id);
    });

    it('should throw an error if bootcamp does not exist', async () => {
      const id = '1484b71a08c88a3bd158d000';

      const res = await testServer.executeOperation({
        query: BOOTCAMP,
        variables: { id },
      });

      const error = res?.body?.singleResult?.errors[0];

      expect(error.message).toBe('Bootcamp not found');
    });
  });

  describe('updateBootcamp', () => {
    it('should update bootcamp', async () => {
      const user = await usersModel.create(inputPublisher);
      const { email, password } = inputPublisher;
      const token = await loginUserService({ email, password });
      const payload = { ...inputBootcamp, user: user._id };
      const bootcampCreated = await bootcampsModel.create(payload);

      const variables = {
        id: String(bootcampCreated._id),
        name: 'One Bootcamp',
        acceptGi: true,
      };

      const res = await testServer.executeOperation(
        {
          query: UPDATE_BOOTCAMP,
          variables,
        },
        { contextValue: token },
      );

      const bootcamp = res?.body?.singleResult?.data?.updateBootcamp;
      const matchId = bootcampCreated._id.equals(bootcamp.id);

      expect(matchId).toBe(true);
      expect(bootcamp.acceptGi).toBe(true);
      expect(bootcamp.acceptGi).not.toBe(bootcampCreated.acceptGi);
      expect(bootcamp.name).toBe(variables.name);
      expect(bootcamp.name).not.toBe(bootcampCreated.name);
    });

    it('should throw an error if user is not publisher', async () => {
      await usersModel.create(inputUser);
      const { email, password } = inputUser;
      const token = await loginUserService({ email, password });

      const variables = {
        id: '1484b71a08c88a3bd158d000',
        name: 'One Bootcamp',
        acceptGi: true,
      };

      const res = await testServer.executeOperation(
        {
          query: UPDATE_BOOTCAMP,
          variables,
        },
        { contextValue: token },
      );

      const error = res?.body?.singleResult?.errors[0];

      expect(error.message).toBe('Not Authorised!');
    });
  });

  describe('deleteBootcamp', () => {
    it('should delete bootcamp', async () => {
      const user = await usersModel.create(inputPublisher);
      const { email, password } = inputPublisher;
      const token = await loginUserService({ email, password });
      const payload = { ...inputBootcamp, user: user._id };
      const bootcampCreated = await bootcampsModel.create(payload);

      const res = await testServer.executeOperation(
        {
          query: DELETE_BOOTCAMP,
          variables: { id: String(bootcampCreated._id) },
        },
        { contextValue: token },
      );

      const id = res?.body?.singleResult?.data?.deleteBootcamp?.id;

      const bootcamp = await bootcampsModel.findById(id);

      expect(bootcamp).toBeNull();
    });

    it('should throw an error if user is not publisher', async () => {
      await usersModel.create(inputUser);
      const { email, password } = inputUser;
      const token = await loginUserService({ email, password });

      const res = await testServer.executeOperation(
        {
          query: DELETE_BOOTCAMP,
          variables: { id: '1484b71a08c88a3bd158d000' },
        },
        { contextValue: token },
      );

      const error = res?.body?.singleResult?.errors[0];

      expect(error.message).toBe('Not Authorised!');
    });
  });
});
