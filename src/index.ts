import express from 'express';
import { MongoClient } from 'mongodb';
import { graphqlHTTP } from 'express-graphql';
import Schema from './Schema';

const app = express();
const mongodb = MongoClient.connect(
  'mongodb://mongoadmin:secret@localhost:27017/relay-compliant',
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

app.listen(3000);
