import { getProducts } from '../app/productsUseCase.js';
// to ask Silvia later
// eslint-disable-next-line node/no-unpublished-import
import { DatabaseError } from '../../shared/utils/error-handling/CustomErrors.js';

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
    me: (_, __, { currentUser, findCurrentUser }) => findCurrentUser(currentUser),
    accounts: (_, __, { findAllUsers }) => findAllUsers(),
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
    createAccount(_, { input }, { createUser }) {
      return createUser(input);
    },
    authorize(_, { email, password }, { authLogin }) {
      return authLogin(email, password);
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
