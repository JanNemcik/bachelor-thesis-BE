import { Schema } from 'mongoose';

export const ConfigsSchema = new Schema({
  node_id: String,
  created_at: Date,
  interval: Number,
  node_type: String
});
