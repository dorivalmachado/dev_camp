import { json } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import app from './app';
import 'dotenv/config';
import { connectMongo } from './database';
import server from './apolloServer';

const startServer = async () => {
  await connectMongo();
  await server.start();
  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: async ({ req: { headers } }) => {
        const token = headers?.authorization?.split(' ')[1] ?? '';

        return { token };
      },
    }),
  );

  const PORT: number = Number(process.env.APP_PORT) || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
