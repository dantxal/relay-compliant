# relay-compliant
This is a relay-compliant API. Built with Nodejs, Express, Typescript and MongoDB. It supports ordering and pagination.

# usage
1. Clone the repo:
2. Add in environment variables (or add a .env file), make sure to add every variable that is inside ".env.example" file.
`Note: You will need a mongodb server to use this api.`
3. Run `yarn install`.
4. Run 'yarn dev'.
5. Access http://localhost:the-port-you-chose/graphql (or ctrl+click the string that will be logged in the console), to access the graphiql and start querying it.

# database schema

This project uses a simple schema for Article objects that contain only the fields _id and text:
```js
  {
    _id: mongodb.ObjectId
    text: string
  }
```

## example query

```graphql
query test {
  viewer {
    articles(last: 3, order: 1, orderField: "text") {
      edges {
        cursor
        node {
          id
          text
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
```

