import { Module } from '@nestjs/common';
import { VideoCallGateway } from '../gateways/video-call.gateway';
import { ChatGateway } from '../gateways/chat.gateway';
import { AuthModule } from './auth.module';
import { RoomModule } from './room.module';
import { MessageModule } from './message.module';

@Module({
  imports: [AuthModule, RoomModule, MessageModule],
  providers: [VideoCallGateway],
})
export class WebSocketModule {}