const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');

//import data sources
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore(); //creates database

const server = new ApolloServer({ 
  typeDefs,
  dataSources: () => ({ //connects LaunchAPI and UserAPI to our graph
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});