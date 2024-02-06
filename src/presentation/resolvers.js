import { getSecrets } from '../infrastructure/auth/Cognito/userValidation/secretsManager.js';
import { SECRETS } from '../utils/enums/enums.js';

// to ask Silvia later
// eslint-disable-next-line node/no-unpublished-import
// import { DatabaseError } from '../../shared/utils/error-handling/CustomErrors.js';

//import { isAutenticated } from '../infrastructure/auth/AuthResolver.js';
import { logger } from '../infrastructure/server.js';
import { allProducts, productById } from '../models/productModel.js';

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
        logger.error('Error fetching public key:', error);
        throw new Error('Failed to fetch public key.');
      }
    },

    me: (_, __, { currentUser, findCurrentUser }) => findCurrentUser(currentUser),
    accounts: async (_, __, { findAllUsers }) => {
      const users = await findAllUsers();

      return users;
    },

    roles: (_, __, { findAllRoles }) => findAllRoles(),
    products: async () => {
      try {
        const results = await allProducts();
        return results;
      } catch (e) {
        logger.error('Error while getting the products', e);
      }
    },

    productById: async (_, { product_id }) => {
      const productData = await productById(product_id);
      return productData ? productData : '';
    },
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
