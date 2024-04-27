const mongoose = require('mongoose')

const Schema = mongoose.Schema

const workoutSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  reps: {
    type: String,
    required: true
  },
  load: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true })

module.exports = mongoose.model('Workout', workoutSchema)