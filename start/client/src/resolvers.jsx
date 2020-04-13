import gql from "graphql-tag";
import { GET_CART_ITEMS } from "./pages/cart";

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

//Virtual fields are added to data you receive back from your graph API. These fields only exist on the client and are useful for decorating server dat with local state.
//Add an isInCart virtual field to our Launch type
export const schema = gql`
  extend type Launch {
    isInCart: Boolean!
  }
`;

//Specify a client resolver on the Launch type to tell Apollo Client how to resolve the virtual field
//Note: the resolver API on the client is the same as the resolver API on the server
export const resolvers = {
  Launch: {
    isInCart: (launch, _, { cache }) => {
      const queryResult = cache.readQuery({
        query: GET_CART_ITEMS
      });

      if(queryResult) {
        return queryResult.cartItems.includes(launch.id);
      }
      return false;
    }
  },

  //Local resolver: to perform more complicated local data updates than direct cache writes (such as adding or removing items from a list). The Apollo cache is already added to the context for you; inside your resolver, you'll use the cache to read and write data.
  //Destructure the Apollo cache from the context in order to read the query that fetches cart items; then add or remove the cart item's id passed into the mutation; then return the updated list from the mutation.
  Mutation: {
    addOrRemoveFromCart: (_, { id }, { cache }) => {
      const queryResult = cache.readQuery({
        query: GET_CART_ITEMS
      });

      if (queryResult) {
        const { cartItems } = queryResult;
        const data = {
          cartItems: cartItems.includes(id)
            ? cartItems.filter(i => i !== id)
            : [...cartItems, id]
        };

        cache.writeQuery({ query: GET_CART_ITEMS, data });
        return data.cartItems;
      }
      return [];
    }
  }
};