import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import Login from "./pages/login";
import injectStyles from "./styles";
import { resolvers, typeDefs } from "./resolvers"; //add default state to the Apollo cache

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "http://localhost:4000/graphql" //***not sure if this URL is correct
});

const client = new ApolloClient({
  cache,
  //attach token from localStorage to GraphQL's request's headers each time a GraphQL operation is made so our server can authorize the user
  link: new HttpLink({
    headers: { authorization: localStorage.getItem('token') },
    uri: "http://localhost:4000/graphql"
  }),
  typeDefs,
  resolvers
});

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem('token'),
    cartItems: []
  }
});

//Query local data from the Apollo cache by adding a @client directive
//For example, query the isLoggedIn field and render a component with useQuery based on the response
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

function IsLoggedIn() {
  const { data } = useQuery(IS_LOGGED_IN);
  return data.isLoggedIn ? <Pages /> : <Login />;
}

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <IsLoggedIn />
  </ApolloProvider>,
  document.getElementById("root")
);

// Example query with vanilla JS
// client
//   .query({
//     query: gql`
//       query GetLaunch {
//         launch(id: 56) {
//           id
//           mission {
//             name
//           }
//         }
//       }
//     `
//   })
//   .then(result => console.log(result));