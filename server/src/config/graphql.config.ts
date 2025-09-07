import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';

export const graphqlConfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
  playground: true,
  introspection: true,
  subscriptions: {
    'graphql-ws': true,
    'subscriptions-transport-ws': true,
  },
  context: ({ req, res }) => ({ req, res }),
};
