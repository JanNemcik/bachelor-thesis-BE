import { Schema } from 'mongoose';

export const CONFIG_SCHEMA = new Schema({
  node_id: Number,
  created_at: Date,
  interval: Number,
  node_type: String
});
