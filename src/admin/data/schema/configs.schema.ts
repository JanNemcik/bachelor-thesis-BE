import { Schema } from 'mongoose';

export const ConfigsSchema = new Schema({
  node_id: Number,
  created_at: Date,
  interval: Number,
  node_type: String
});
