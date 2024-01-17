import gql from 'graphql-tag';

const typeDefs = gql`
  scalar DateTime

  type Query {
    me: User
    accounts: [User!]!
    roles: [Role!]!
  }

  type User @key(fields: "idCostumer") {
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
    createAccount(input: CreateAccount!): AuthPayload!
    authorize(email: String!, password: String!): AuthPayload!
    createRole(input: RoleInput!): Role!
  }
`;

export { typeDefs };
