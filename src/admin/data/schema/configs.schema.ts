import { Schema } from 'mongoose';

export const CONFIG_SCHEMA = new Schema({
  node_id: String,
  created_at: Date,
  interval: String,
  node_type: String
});
