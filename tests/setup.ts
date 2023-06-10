import mongoose from 'mongoose';
import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { loadFilesSync } from '@graphql-tools/load-files';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { applyMiddleware } from 'graphql-middleware';
import permissions from '../src/permissions';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL!.toString());
});

afterEach(async () => {
  const dbCollections = await mongoose.connection.db.listCollections().toArray();
  await Promise.all(
    dbCollections.map(
      (c) => mongoose.connection.db.collection(c.name).deleteMany(),
    ),
  );
});

afterAll(async () => {
  await mongoose.connection.close();
});

const buildApolloServer = () => {
  const app = express();
  const typeDefs = loadFilesSync('**/*', { extensions: ['.graphql'] });
  const resolvers = loadFilesSync('**/*', { extensions: ['.resolvers.ts'] });
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // @ts-ignore
  const testServer = new ApolloServer({
    schema: applyMiddleware(schema, permissions),
  });

  return testServer;
};

export default buildApolloServer;
