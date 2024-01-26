import gql from 'graphql-tag';

const typeDefs = gql`
  scalar DateTime

  type Query {
    me: User
    accounts: [User!]!
    roles: [Role!]!
    products: [Product]
  }

  type User {
    id: ID!
    email: String!
    roles: [Role]
    idCostumer: String
    created: DateTime!
  }

  type Role {
    email: String!
    role: String!
  }

  input RoleInputById {
    email: String!
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
`;

export { typeDefs };
