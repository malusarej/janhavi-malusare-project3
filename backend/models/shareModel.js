// shareModel.js

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shareSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Share', shareSchema);
