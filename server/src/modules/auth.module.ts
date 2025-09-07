import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { AuthResolver } from '../resolvers/auth.resolver';
import { UserService } from '../services/user.service';
import { PrismaService } from '../services/prisma.service';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    UserService,
    PrismaService,
    JwtStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}