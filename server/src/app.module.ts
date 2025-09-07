import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './modules/auth.module';
import { RoomModule } from './modules/room.module';
import { MessageModule } from './modules/message.module';
import { WebSocketModule } from './modules/websocket.module';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
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
    }),
    AuthModule,
    RoomModule,
    MessageModule,
    WebSocketModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}