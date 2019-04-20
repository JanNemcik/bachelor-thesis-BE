import { Schema } from 'mongoose';

export const AUTH_SCHEMA = new Schema({
  name: String,
  password: String
});
