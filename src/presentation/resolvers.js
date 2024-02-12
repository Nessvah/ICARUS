import { getSecrets } from '../aws/auth/Cognito/userValidation/secretsManager.js';
import { SECRETS } from '../utils/enums/enums.js';
//import { isAutenticated } from '../infrastructure/auth/AuthResolver.js';
import { logger } from '../infrastructure/server.js';
import { allProducts, productById, productByName, productsByPrice } from '../models/productModel.js';
import { allCustomers, customerById, customerByEmail } from '../models/customersModel.js';
import { allTables } from '../models/tablesInformation.js';
import { allOrderItems, orderItemsById } from '../models/orderItemsMode.js';
import {
  categoriesProperties,
  customersProperties,
  orderItemsProperties,
  ordersProperties,
  productReviewsProperties,
  productsProperties,
  shipmentsProperties,
} from '../models/columnsProperties.js';
import { ordersById, allOrders } from '../models/ordersModel.js';

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

    //! Testing metrics with prometheus
    products: async (_, __, { req }) => {
      // start timer

      try {
        const results = await allProducts();
        return results;
      } catch (e) {
        logger.error('Error while getting the products', e);
      }
    },
    customers: async () => {
      try {
        const results = await allCustomers();
        return results;
      } catch (e) {
        logger.error('Error getting customers ', e);
      }
    },
    customerById: async (_, { customer_id }) => {
      const customerData = await customerById(customer_id);
      return customerData ? customerData[0][0] : '';
    },
    productById: async (_, { product_id }) => {
      const productData = await productById(product_id);
      return productData ? productData[0][0] : '';
    },
    productByName: async (_, { product_name }) => {
      const productData = await productByName(product_name);
      return productData ? productData : '';
    },
    productsByPrice: async (_, { price }) => {
      const { min, max } = price;
      const productData = await productsByPrice(min, max);
      return productData ? productData : '';
    },
    customerByEmail: async (_, { email }) => {
      const customerData = await customerByEmail(email);
      return customerData ? customerData[0][0] : '';
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
    allTables: async () => {
      try {
        const tablesResponse = await allTables();
        const tables = tablesResponse[0].map((table) => {
          return table.Tables_in_icarus;
        });
        return tables;
      } catch (e) {
        throw new Error(e);
      }
    },
    allOrders: async () => {
      try {
        const orders = await allOrders();
        return orders;
      } catch (e) {
        throw new Error(e);
      }
    },
    allOrderItems: async () => {
      try {
        const allOrders = await allOrderItems();
        return allOrders;
      } catch (e) {
        throw new Error(e);
      }
    },
    categoriesProperties: async () => {
      try {
        const columnsInfo = await categoriesProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    customersProperties: async () => {
      try {
        const columnsInfo = await customersProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    orderItemsProperties: async () => {
      try {
        const columnsInfo = await orderItemsProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    ordersProperties: async () => {
      try {
        const columnsInfo = await ordersProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    productReviewsProperties: async () => {
      try {
        const columnsInfo = await productReviewsProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    productsProperties: async () => {
      try {
        const columnsInfo = await productsProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    shipmentsProperties: async () => {
      try {
        const columnsInfo = await shipmentsProperties();
        const properties = {};
        columnsInfo.forEach((column) => {
          properties[column.Field] = {
            Field: column.Field,
            Type: column.Type,
            Null: column.Null,
            Key: column.Key,
            Default: column.Default,
            Extra: column.Extra,
          };
        });
        return properties;
      } catch (e) {
        throw new Error(e);
      }
    },
    orderItemsById: async (_, { order_item_id }) => {
      try {
        const response = await orderItemsById(order_item_id);
        return response;
      } catch (e) {
        throw new Error(e);
      }
    },
    ordersById: async (_, { order_id }) => {
      try {
        const response = await ordersById(order_id);
        return response;
      } catch (e) {
        throw new Error(e);
      }
    },
  },
  Order: {
    customer: async (parent) => {
      try {
        const customers = await allCustomers();
        return customers.find((customer) => customer.customer_id === parent.customer_id);
      } catch (e) {
        throw new Error(e);
      }
    },
  },
  OrderItems: {
    order: async (parent) => {
      try {
        const orders = await allOrders();
        return orders.find((order) => order.order_id === parent.order_id);
      } catch (e) {
        throw new Error(e);
      }
    },
    product: async (parent) => {
      try {
        const products = await allProducts();
        return products.find((product) => product.product_id === parent.product_id);
      } catch (e) {
        throw new Error(e);
      }
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
    async createCustomer(_, { input }, { createNewCustomer }) {
      const result = await createNewCustomer(input);
      return result[0];
    },
    async updateCustomer(_, { id, input }, { updateCustomer }) {
      const result = await updateCustomer(id, input);
      return result[0];
    },
    async deleteCustomer(_, { id }, { deleteCustomer }) {
      const result = await deleteCustomer(id);
      return result;
    },
    async createProduct(_, { input }, { createProduct }) {
      const result = await createProduct(input);
      return result[0];
    },
  },
};
export { resolvers };
