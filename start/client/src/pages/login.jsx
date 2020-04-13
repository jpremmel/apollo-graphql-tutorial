import React from "react";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { LoginForm, Loading } from "../components";
import ApolloClient from "apollo-client";

export const LOGIN_USER = gql`
  mutation login($email: String!) {
    login(email: $email)
  }
`;

export default function Login() {
  const client = useApolloClient(); // Get the currently configured client instance
  // Bind the LOGIN_USER mutation to our component by passing it to the useMutation hook.
  // Also pass an onCompleted callback to useMutation that will be called once the mutation is complete; this is where we save the login tokan to localStorage in order to persist the login between sessions.
  const [login, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted({ login }) {
      localStorage.setItem("token", login);
      //direct cache write
      client.writeData({ data: { isLoggedIn: true } });
    }
  });
  if (loading) return <Loading />;
  if (error) return <p>An error occurred.</p>;
  return <LoginForm login={login} />;
}