import { Document } from 'mongoose';

export interface AuthModel extends Document {
  readonly name: string;
  readonly password: string;
}
