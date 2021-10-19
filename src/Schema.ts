import { 
  GraphQLObjectType, 
  GraphQLNonNull, 
  GraphQLID, 
  GraphQLString, 
  GraphQLBoolean, 
  GraphQLList, 
  GraphQLSchema 
} from 'graphql'

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

const ArticleConnection = new GraphQLObjectType({
  name: 'ArticleConnection',
  fields: () => ({
    edges: {
      type: new GraphQLList(ArticleEdge),
      resolve() {
        return [];
      },
    },
    pageInfo: {
      type: new GraphQLNonNull(PageInfo),
    },
  }),
});

const ArticleEdge = new GraphQLObjectType({
  name: 'ArticleEdge',
  fields: () => ({
    cursor: {
      type: GraphQLString,
    },
    node: {
      type: Article,
    },
  }),
});

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    allArticles: {
      type: ArticleConnection,
      resolve() {
        return {};
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
