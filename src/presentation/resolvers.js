import { getProducts } from '../app/productsUseCase.js';
import { getSecrets } from '../infrastructure/auth/Cognito/userValidation/secretsManager.js';
import { SECRETS } from '../utils/enums/enums.js';
// to ask Silvia later
// eslint-disable-next-line node/no-unpublished-import
// import { DatabaseError } from '../../shared/utils/error-handling/CustomErrors.js';

//TESTING PURPOSES VARIABLES - TO DELETE LATER
const shipments = [
  {
    _id: '1',
    order_id: 'order1',
    shipmentDate: '2024-01-15T00:00:00.000Z',
    shipmentStatus: ['Delivered'],
    address: {
      street: 'Rua do Ouro Negro',
      city: 'London',
      state: 'Bragança',
      zipCode: '5300-171',
      country: 'Portugal',
    },
    billingAddress: {
      street: 'Rua Henrique Tavares',
      city: 'Bragança',
      state: 'Bragança',
      zipCode: '5300-580',
      country: 'Portugal',
    },
  },
];
// eslint-disable-next-line no-unused-vars
const orders = [
  {
    id: 'order1',
  },
];

const resolvers = {
  // DateTime: DateTimeResolver,
  Query: {
    secrets: async () => {
      try {
        const key = await getSecrets(SECRETS.PUBLIC_KEY);

        if (!key) {
          throw new Error('Public key not available.');
        }
        return { publicKey: key };
      } catch (error) {
        console.error('Error fetching public key:', error);
        throw new Error('Failed to fetch public key.');
      }
    },
    me: async (_, __, { currentUser, findCurrentUser }) => {
      const result = await findCurrentUser(currentUser);
      return result;
    },
    accounts: async (_, __, { findAllUsers }) => {
      const result = await findAllUsers();
      return result.users;
    },
    roles: (_, __, { findAllRoles }) => findAllRoles(),
    products: async (_, __, { currentUser }) => await getProducts(currentUser),
    //get shipment by id
    getShipmentById: (_, { _id }) => {
      const shipment = shipments.find((shipment) => shipment._id === _id);
      if (!shipment) {
        throw new Error(`Shipment with ID ${_id} not found`);
      }
      return shipment;
    },
    //get all shipments
    getAllShipments: () => {
      if (shipments.length === 0) {
        throw new Error('No shipments found');
      }
      return shipments;
    },
    //get shipment by order id
    getShipmentsByOrderId: (_, { order_id }) => {
      const matchingShipments = shipments.filter((shipment) => shipment.order_id === order_id);
      if (matchingShipments.length === 0) {
        throw new Error(`No shipments found for order_id ${order_id}`);
      }
      return matchingShipments;
    },
  },

  Mutation: {
    async createAccount(_, { input }, { createUser }) {
      const result = await createUser(input);
      return result.user;
    },
    async authorize(_, { input }, { authLogin }) {
      return await authLogin(input);
    },
    createRole(_, { input }, { createNewRole }) {
      return createNewRole(input);
    },
    addRoleToUSer(_, { input }, { addRoleUser }) {
      return addRoleUser(input);
    },
    //update shipment by id
    updateShipmentAddress: (_, { _id, address }) => {
      //find shipment by _id
      const shipment = shipments.find((shipment) => shipment._id === _id);
      if (!shipment) {
        throw new Error(`Shipment with ID ${_id} not found`);
      }
      // update the address
      shipment.address = address;

      return shipment;
    },
  },
};

export { resolvers };
