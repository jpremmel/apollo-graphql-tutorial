const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers');
const isEmail = require('isemail');

//import data sources
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore(); //creates database

const server = new ApolloServer({
  // Don't use this specific implementation in production since it's not secure, but all of the concepts outlined here are transferable to how you'd implement authentication in a real world application
  context: async ({ req }) => {
    //simple auth check on every request
    const auth = req.headers && req.headers.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };
    //find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = users && users[0] || null;

    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers, //Apollo Server will automatically add the launchAPI and userAPI to our resolvers' context
  dataSources: () => ({ //connects LaunchAPI and UserAPI to our graph
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});