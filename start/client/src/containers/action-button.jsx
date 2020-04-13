import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { GET_LAUNCH_DETAILS } from "../pages/launch";
import Button from "../components/button";

//add @client directive to tell Apollo to resolve this mutation from the cache instead of a remote server
const TOGGLE_CART = gql`
  mutation addOrRemoveFromCart($launchId: ID!) {
    addOrRemoveFromCart(id: $launchId) @client
  }
`;

export const CANCEL_TRIP = gql`
  mutation cancel($launchId: ID!) {
    cancelTrip(launchId: $launchId) {
      success
      message
      launches {
        id
        isBooked
      }
    }
  }
`;

//Use the isBooked prop passed into the component to determine which mutation we should fire. Pass local mutations to the useMutation hook.
const ActionButton = ({ isBooked, id, isInCart }) => {
  const [mutate, { loading, error }] = useMutation(
    isBooked ? CANCEL_TRIP : TOGGLE_CART,
    {
      variables: { launchId: id },
      refetchQueries: [
        {
          query: GET_LAUNCH_DETAILS,
          variables: { launchId: id }
        }
      ]
    }
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>An error occurred</p>;

  return (
    <div>
      <Button onClick={() => mutate()} data-testid={"action-button"}>
        {isBooked
          ? "Cancel This Trip"
          : isInCart
          ? "Remove from Cart"
          : "Add to Cart"}
      </Button>
    </div>
  );
};

export default ActionButton;