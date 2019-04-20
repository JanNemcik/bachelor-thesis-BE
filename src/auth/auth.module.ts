import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './config/jwt.strategy';
import { AuthController } from './web-api/auth.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   { name: 'AuthModel', schema: AuthSchema, collection: 'users' }
    // ]),
    JwtModule.register({
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 3600
      }
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
