import gql from "graphql-tag";

//Build client schema by extending the types of our server schema and wrapping it in a gql function. Also add local fields to server data such as isInCart.
export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [ID!]!
  }

  extend type Launch {
    isInCart: Boolean!
  }

  extend type Mutation {
    addOrRemoveFromCart(id: ID!): [ID!]!
  }
`;

export const resolvers = {};