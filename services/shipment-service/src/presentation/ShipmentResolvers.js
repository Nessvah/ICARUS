import { DateTimeResolver } from 'graphql-scalars';

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

//RESOLVERS
const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
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

export default resolvers;
