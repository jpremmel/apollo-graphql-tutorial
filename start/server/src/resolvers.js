const { paginateResults } = require('./utils');

module.exports = {
  //The code below shows the resolver functions for the Query type fields: launches, launch, and me. The first argument to our top-level resolvers, parent, is always blank because it refers to the root of our graph. The second argument refers to any arguments passed into our query, which we use in our launch query to fetch a launch by its id. Finally, we destructure our data sources from the third argument, context, in order to call them in our resolvers.
  Query: {
    launches: async (_, { pageSize = 20, after}, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      //we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor of the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !== allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },

    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    
      me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser()
  },

  Mission: {
    // make sure the default size is 'large' in case user doesn't specify
    // The first argument passed into our resolver is the parent, which refers to the mission object. The second argument is the size we pass to our missionPatch field, which we use to determine which property on the mission object we want our field to resolve to.
    missionPatch: (mission, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL'
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    }
  },

  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id })
  },

  User: {
    trips: async (_, __, { dataSources }) => {
      //get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

      if (!launchIds.length) return [];

      //look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds
        }) || []
      );
    }
  },

  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) return Buffer.from(email).toString('base64');
    },
    
    bookTrips: async (_, { launchIds }, { dataSources }) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchesByIds({
        launchIds
      });

      return {
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length
            ? 'trips booked successfully'
            : `the following launches couldn't be booked: ${launchIds.filter(
              id => !results.includes(id)
            )}`,
        launches
      };
    },

    cancelTrip: async (_, { launchId }, { dataSources }) => {
      const result = await dataSources.userAPI.cancelTrip({ launchId });

      if (!result)
        return {
          success: false,
          message: 'failed to cancel trip'
        };

      const launch = await dataSources.launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: 'trip cancelled',
        launches: [launch]
      };
    }
  }
};

// Note: GraphQL has default resolvers; therefore, we don't have to write a resolver for a field if the parent object has a property with the same name.