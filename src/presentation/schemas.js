import gql from 'graphql-tag';

const typeDefs = gql`
  scalar DateTime

  type Query {
    secrets: Key!
    me: User!
    accounts: [User!]!
    roles: [Role!]!
    getProductById(product_id: ID!): Product
    products: [Product]
    productById(product_id: ID!): Product
    getShipmentById(_id: ID!): Shipment
    getAllShipments: [Shipment]
    getShipmentsByOrderId(order_id: String!): [Shipment]
  }

  type Key {
    publicKey: String
    privateKey: String
  }

  type User {
    email: String!
    role: String
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

  input AuthorizeUser {
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
    authorize(input: AuthorizeUser!): AuthPayload!
    createRole(input: RoleInput!): Role!
    addRoleToUSer(input: RoleInputById!): User!
    updateShipmentAddress(_id: ID!, address: AddressInput!): Shipment
    createProduct(input: ProductInput): Product
  }

  type Product {
    product_id: ID!
    product_name: String!
    price: Float!
    description: String!
    icon_class: String!
    icon_label: String!
  }

  input ProductInput {
    product_name: String!
    price: Float!
    description: String!
    icon_class: String!
    icon_label: String!
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
