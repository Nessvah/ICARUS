import gql from 'graphql-tag';

const typeDefs = gql`
  scalar DateTime

  type Query {
    me: User
    accounts: [User!]!
    roles: [Role!]!
    products: [Product]
    getShipmentById(_id: ID!): Shipment
    getAllShipments: [Shipment]
    getShipmentsByOrderId(order_id: String!): [Shipment]
  }

  type User {
    id: ID!
    email: String!
    roles: [Role]
    idCostumer: String
    created: DateTime!
  }

  type Role {
    id: ID!
    role: String!
  }

  input RoleInputById {
    id: ID!
    role: String!
  }

  input CreateAccount {
    email: String!
    password: String!
  }

  input RoleInput {
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    createAccount(input: CreateAccount!): User!
    authorize(email: String!, password: String!): AuthPayload!
    createRole(input: RoleInput!): Role!
    addRoleToUSer(input: RoleInputById!): User!
    updateShipmentAddress(_id: ID!, address: AddressInput!): Shipment
  }

  type Product {
    ProductId: Int
    SKU: String!
    Name: String!
    Description: String
    Price: Float
    ImageUrl: String
    StockLevel: Int
    CategoryId: Int
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  type Address {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type Shipment {
    _id: ID!
    order_id: String!
    shipmentDate: DateTime!
    shipmentStatus: [String!]!
    address: Address!
    billingAddress: Address
  }

  #database error test - to delete later
  # type Query {
  #   testDatabaseError: String
  # }
`;

export { typeDefs };
