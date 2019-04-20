import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { Observable, from, asyncScheduler, throwError, of } from 'rxjs';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import { hash, genSalt, compare } from 'bcrypt';
import { AuthenticationDataDto, AuthModel, JwtTokenModel } from '../data';
import { JsonWebTokenError } from 'jsonwebtoken';
import { createInstance } from '../../shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('AuthModel') private readonly authModel: Model<AuthModel>
  ) {}

  /**
   *
   * @param payload
   */
  signIn(payload: AuthenticationDataDto): Observable<{ token: string }> {
    return this.verifyUser(payload).pipe(
      tap(result => {
        if (!result) {
          throw new BadRequestException('User not found');
        }
      }),
      map(() => {
        const token = this.jwtService.sign(payload);
        return { token };
      })
    );
  }

  /**
   *
   * @param token
   */
  verifyToken(token: string): Observable<JwtTokenModel> {
    return from(this.jwtService.verifyAsync<JwtTokenModel>(token)).pipe(
      map(data => ({
        ...data,
        iat: new Date((data.iat as number) * 1000),
        exp: new Date((data.exp as number) * 1000)
      })),
      catchError(({ name }: JsonWebTokenError) =>
        throwError(new UnauthorizedException(name))
      )
    );
  }

  /**
   *
   * @param payload
   */
  validateUser(payload: AuthenticationDataDto): Promise<any> {
    const { name, password } = payload;
    // TODO: prerobit na promise
    // this.authModel
    //   .findOne({ name })
    //   .exec()
    //   .then((foundUser: AuthenticationDataDto) =>
    //     compare(password, foundUser.password)
    //   )
    //   .catch(err => {
    //     throw err;
    //   });
    return this.authModel
      .findOne({ name })
      .exec()
      .then((foundUser: AuthenticationDataDto) =>
        compare(password, foundUser.password)
      )
      .catch(err => console.error(err));
    return from(this.authModel.findOne({ name }).exec(), asyncScheduler)
      .pipe(
        mergeMap((foundUser: AuthenticationDataDto) =>
          from(compare(password, foundUser.password))
        )
      )
      .toPromise();
  }

  /**
   *
   * @param payload
   */
  verifyUser(payload: AuthenticationDataDto) {
    const { password, name } = payload;
    return from(
      this.authModel
        .findOne({ name })
        .lean()
        .exec()
    ).pipe(
      mergeMap((foundUser: AuthenticationDataDto) => {
        return !!!foundUser
          ? of(null)
          : from(compare(password, foundUser.password)).pipe(
              tap(result => {
                if (!result) {
                  throw new NotFoundException('Wrong password!!');
                }
              })
            );
      })
    );
  }

  /**
   *
   * @param payload
   */
  addUser(payload: AuthenticationDataDto) {
    const { password, name } = payload;
    return from(genSalt(this.generateSaltRounds())).pipe(
      //
      mergeMap(generatedSalt => from(hash(password, generatedSalt))),
      //
      map(generatedHash => ({ name, password: generatedHash })),
      //
      map(newUser => createInstance<AuthModel>(this.authModel, newUser)),
      //
      mergeMap(createdUser => from(createdUser.save())),
      //
      mergeMap(() => this.signIn(payload)),
      //
      map(token => {
        if (token) {
          return {
            ...token,
            name
          };
        }
        throw new BadRequestException('User not created');
      })
    );
  }

  //
  private generateSaltRounds() {
    const min = Math.random() * 5 + 5;
    const max = Math.random() * 5 + 10;
    return Math.floor(min + Math.random() * (max + 1 - min));
  }
}
