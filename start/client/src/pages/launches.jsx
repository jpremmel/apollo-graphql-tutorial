import React, { Fragment } from "react";
import { useQuery } from "@apollo/react-hooks"; // useQuery is a React Hook that fetches a GraphQL query and exposes the result so you can render your UI based on the data it returns
import gql from "graphql-tag";

import { LaunchTile, Header, Button, Loading } from "../components";

//define GraphQL fragment - the type must correspond to a type in our schema (in this case, "Launch")
export const LAUNCH_TILE_DATA = gql`
  fragment LaunchTile on Launch {
    id
    isBooked
    rocket {
      id
      name
    }
    mission {
      name
      missionPatch
    }
  }
`;

//define a query to fetch a list of launches
const GET_LAUNCHES = gql`
  query launchList($after: String) {
    launches(after: $after) {
      cursor
      hasMore
      launches {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;

//pass the query to Apollo's useQuery component to render the list
const Launches = () => {
  const {
    data,
    loading,
    error,
    fetchMore //for pagination
  } = useQuery(GET_LAUNCHES);

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  return (
    <Fragment>
      <Header />
      {data.launches &&
        data.launches.launches &&
        data.launches.launches.map(launch => (
          <LaunchTile key={launch.id} launch={launch} />
        ))}

      {/*for pagination*/}
      {data.launches && 
        data.launches.hasMore && (
          <Button
            onClick={() =>

              fetchMore({
                variables: {
                  after: data.launches.cursor,
                },

                updateQuery: (prev, { fetchMoreResult, ...rest }) => {
                  if (!fetchMoreResult) return prev;
                  return {
                    ...fetchMoreResult,
                    launches: {
                      ...fetchMoreResult.launches,
                      launches: [
                        ...prev.launches.launches,
                        ...fetchMoreResult.launches.launches,
                      ],
                    },
                  };
                },
              })
            }
          >
            Load More
          </Button>
        )
      }

    </Fragment>
  );
};

export default Launches;