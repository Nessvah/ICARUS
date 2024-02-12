import gql from 'graphql-tag';

const typeDefs = gql`
  scalar DateTime

  type Query {
    secrets: Key!
    me: User!
    accounts: [User!]!
    roles: [Role!]!
    products: [Product]
    productById(product_id: ID!): Product
    productByName(product_name: String!): [Product]
    productsByPrice(price: Price!): [Product]
    getShipmentById(_id: ID!): Shipment
    getAllShipments: [Shipment]
    getShipmentsByOrderId(order_id: String!): [Shipment]
    customers: [Customer]
    customerById(customer_id: ID!): Customer
    customerByEmail(email: String!): Customer
    allTables: [String!]!
    categoriesProperties: CategoriesProperties!
    customersProperties: CustomerProperties!
    orderItemsProperties: OrderItemsProperties!
    ordersProperties: OrdersProperties!
    productReviewsProperties: ProductReviewsProperties!
    productsProperties: ProductsProperties!
    shipmentsProperties: ShipmentsProperties!
    allOrderItems: [OrderItems]
    orderItemsById(order_item_id: ID!): OrderItems
    ordersById(order_id: ID!): Order
    allOrders: [Order]
  }

  type Categories {
    category_id: ID!
    category_name: String!
    icon_class: String!
    icon_label: String!
  }

  type OrderItems {
    order_item_id: ID!
    order: Order
    product: Product
    quantity: Int!
    price: Float!
    icon_class: String!
    icon_label: String!
  }

  type Customer {
    email: String!
    customer_id: ID!
    customer_name: String!
    icon_class: String!
    icon_label: String!
  }

  type Order {
    order_id: ID!
    order_date: DateTime!
    customer: Customer
    icon_class: String!
    icon_label: String!
  }

  type ProductReviews {
    review_id: ID!
    product: Product!
    customer: Customer!
    rating: Int
    review_text: String
    review_date: DateTime
    icon_class: String
    icon_label: String
  }
  type ColumnProperties {
    Field: String!
    Type: String!
    Null: String!
    Key: String!
    Default: String
    Extra: String!
  }

  type CategoriesProperties {
    category_id: ColumnProperties!
    category_name: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  type CustomerProperties {
    customer_id: ColumnProperties!
    customer_name: ColumnProperties!
    email: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  type OrderItemsProperties {
    order_item_id: ColumnProperties!
    order_id: ColumnProperties!
    product_id: ColumnProperties!
    quantity: ColumnProperties!
    Price: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  type OrdersProperties {
    order_id: ColumnProperties!
    order_date: ColumnProperties!
    customer_id: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  type ProductReviewsProperties {
    review_id: ColumnProperties!
    product_id: ColumnProperties!
    customer_id: ColumnProperties!
    rating: ColumnProperties!
    review_text: ColumnProperties!
    review_date: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  type ProductsProperties {
    product_id: ColumnProperties!
    product_name: ColumnProperties!
    price: ColumnProperties!
    description: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  type ShipmentsProperties {
    shipment_id: ColumnProperties!
    order_id: ColumnProperties!
    shipment_date: ColumnProperties!
    tracking_number: ColumnProperties!
    icon_class: ColumnProperties!
    icon_label: ColumnProperties!
  }

  input Price {
    min: Float!
    max: Float!
  }
  type Key {
    publicKey: String
    privateKey: String
  }

  type User {
    email: String!
    created: String!
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
    token: Token!
    user: User!
  }

  type Token {
    accessToken: String!
    idToken: String!
    refreshToken: String!
  }

  type Mutation {
    createAccount(input: CreateAccount!): User!
    authorize(input: AuthorizeUser!): AuthPayload!
    createRole(input: RoleInput!): Role!
    addRoleToUSer(input: RoleInputById!): User!
    updateShipmentAddress(_id: ID!, address: AddressInput!): Shipment
    createProduct(input: ProductInput): Product
    createCustomer(input: CustomerInput!): Customer
    updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer
    deleteCustomer(id: ID!): DeleteCustomerPayload!
  }

  type DeleteCustomerPayload {
    message: String!
  }

  input CustomerInput {
    email: String!
    customer_name: String!
    icon_class: String!
    icon_label: String!
  }

  input UpdateCustomerInput {
    email: String
    customer_name: String
    icon_class: String
    icon_label: String
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
    price: String!
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
`;
export { typeDefs };
