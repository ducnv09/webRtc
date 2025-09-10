import { Module, forwardRef } from "@nestjs/common";
import { MessageResolver } from "src/resolvers/message.resolver";
import { MessageService } from "src/services/message.service";
import { PrismaService } from "src/services/prisma.service";
import { SocketEventService } from "src/services/socket-event.service";
import { ChatGateway } from "src/gateways/chat.gateway";

@Module({
    providers: [
        MessageService,
        MessageResolver,
        PrismaService,
        SocketEventService,
        ChatGateway,
    ],
    exports: [
        MessageService,
        SocketEventService,
        ChatGateway,
    ],
})
export class MessageModule {}