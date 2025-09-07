import { Module } from "@nestjs/common";
import { MessageResolver } from "src/resolvers/message.resolver";
import { MessageService } from "src/services/message.service";
import { PrismaService } from "src/services/prisma.service";

@Module({
    providers: [
        MessageService,
        MessageResolver,
        PrismaService,
    ],
    exports: [
        MessageService,
    ],
})
export class MessageModule {}