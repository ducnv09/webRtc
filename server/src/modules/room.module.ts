import { Module } from "@nestjs/common";
import { RoomResolver } from "src/resolvers/room.resolver";
import { PrismaService } from "src/services/prisma.service";
import { RoomService } from "src/services/room.service";

@Module({
    providers: [
        RoomService,
        RoomResolver,
        PrismaService
    ],
    exports: [
        RoomService,
    ],
})
export class RoomModule {}