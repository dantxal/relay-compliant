import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';
import { graphqlHTTP } from 'express-graphql';
import Schema from './Schema';

const { PORT, MONGO_URL }: any = process.env;
if (!PORT || !MONGO_URL) {
  console.error('Please make sure every environment variable is set properly.');
}

const app = express();
const mongodb = MongoClient.connect(
  MONGO_URL,
);

app.use(
  '/graphql',
  graphqlHTTP(async () => ({
    schema: Schema,
    graphiql: true,
    context: {
      mongodb: await mongodb,
    },
  })),
);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
