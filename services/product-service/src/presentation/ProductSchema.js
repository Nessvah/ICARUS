// import gpl from 'graphql-tag';

// // const typeDefs = gpl`

// // extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"]);

// // type Query {
// //     product(id: ID!) : ProductItf
// // }

// // # Interfaces define a set of common fields that can be implemented by multiple types.

// // # SKU Interface
// // # should move to shared folder

// // interface SkuItf {
// //     sku: String
// // }

// // interface ImageItf {
// //     imgUrl: String
// // }

// // interface ProductItf implements SkuItf & ImageItf {
// //     id: ID!
// //     name: String!
// //     description: String
// //     sku: String
// //     price: Double!
// //     stockQuantity: Int!
// //     imgUrl: String
// // }

// // # An entity is a type that represents a distinct, identifiable object that can be
// // # uniquely identified across multiple services.

// // # @key - Designates an object type as an entity and specifies its key fields
// // # (a set of fields that the subgraph can use to uniquely identify any instance of the entity)

// // type Product implements ProductItf & SkuItf & ImageItf @key(fields: "id") {
// //     id: ID!
// //     name: String!
// //     description: String
// //     sku: String
// //     price: Double!
// //     stockQuantity: Int!
// //     imgUrl: String
// //     category: ProductCategory
// // }

// // # @shareable - Indicates that an object type's field is allowed to be resolved by multiple subgraphs

// // type ProductCategory @shareable {
// //     id: ID!
// //     name: String!
// // }
// // `;

// const typeDefs = gpl`

// extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"]);

// type Query {
//     product(id: ID!) : ProductItf
// }

// type Product  @key(fields: "id") {
//     id: ID!
//     name: String!
//     description: String
//     sku: String
//     price: Double!
//     stockQuantity: Int!
//     imgUrl: String
//     category: ProductCategory
// }

// type ProductCategory @shareable {
//     id: ID!
//     name: String!
// }
// `;

// export { typeDefs };
