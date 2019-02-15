import { Schema } from 'mongoose';

export const AuthSchema = new Schema({
  name: String,
  password: String
});
