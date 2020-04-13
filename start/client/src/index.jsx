import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
// import gql from "graphql-tag"; // for query w/vanilla JS (below)
import { ApolloProvider } from "@apollo/react-hooks";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import injectStyles from "./styles";

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
  })
});

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem('token'),
    cartItems: []
  }
});

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
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