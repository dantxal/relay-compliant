import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import Schema from './Schema';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: Schema,
  graphiql: true,
}));

app.listen(3000);