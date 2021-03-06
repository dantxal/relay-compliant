import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema,
  GraphQLInt,
} from 'graphql';
import { MongoClient } from 'mongodb';
import CursorType from './graphql/Cursor';
import { getArticles } from './models/Article';

interface ApiContext {
  mongodb: MongoClient
}

const Article = new GraphQLObjectType({
  name: 'Article',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve(parent) {
        return parent._id.toString();
      },
    },
    text: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

export const PageInfo = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

const ArticleEdge = new GraphQLObjectType({
  name: 'ArticleEdge',
  fields: () => ({
    cursor: {
      type: CursorType,
      resolve(parent) {
        return {
          value: parent._id.toString(),
        };
      },
    },
    node: {
      type: Article,
      resolve(parent) {
        return parent;
      },
    },
  }),
});

const ArticleConnection = new GraphQLObjectType({
  name: 'ArticleConnection',
  fields: () => ({
    edges: {
      type: new GraphQLList(ArticleEdge),
      resolve(parent) {
        return parent.query.toArray();
      },
    },
    pageInfo: {
      type: new GraphQLNonNull(PageInfo),
    },
  }),
});

export function createConnectionArguments() {
  return {
    first: {
      type: GraphQLInt,
    },
    last: {
      type: GraphQLInt,
    },
    before: {
      type: CursorType,
    },
    after: {
      type: CursorType,
    },
    order: {
      type: GraphQLInt,
    },
    orderField: {
      type: GraphQLString,
    },

  };
}

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    articles: {
      type: ArticleConnection,
      args: createConnectionArguments(),
      resolve(parent, args, { mongodb }: ApiContext) {
        return getArticles(mongodb, args);
      },
    },
  }),
});

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      viewer: {
        type: Viewer,
        resolve() {
          return {
            id: 'VIEWER_ID',
          };
        },
      },
    },
  }),
});

export default Schema;
