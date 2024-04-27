// controllers/shareController.js

const User = require('../models/userModel');
const Workout = require('../models/workoutModel');

// Function to send a share request
exports.requestShare = async (req, res) => {
  const { shareUsername, workoutId } = req.body;
  const { user } = req;

  try {
    // Check if the shareUsername exists
    const recipientUser = await User.findOne({ email: shareUsername });
    if (!recipientUser) {
      return res.status(400).json({ error: 'Recipient user not found' });
    }

    // Create a share request
    const shareRequest = {
      fromUser: user.email,
      toUser: shareUsername,
      workoutId: workoutId,
      status: 'pending'
    };

    // Save the share request to recipientUser's document
    recipientUser.shareRequests.push(shareRequest);
    await recipientUser.save();

    res.status(200).json({ message: 'Share request sent successfully' });
  } catch (error) {
    console.error('Error sending share request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to accept a share request
exports.acceptShare = async (req, res) => {
  const { shareRequestId, workoutId } = req.body;
  const { user } = req;

  try {
    // Find the share request and update its status to 'accepted'
    const recipientUser = await User.findOne({ email: user.email });
    const shareRequestIndex = recipientUser.shareRequests.findIndex(request => request._id.toString() === shareRequestId);
    if (shareRequestIndex === -1) {
      return res.status(400).json({ error: 'Share request not found' });
    }

    recipientUser.shareRequests[shareRequestIndex].status = 'accepted';
    await recipientUser.save();

    // Add the shared workout to the recipientUser's document
    const sharedWorkout = await Workout.findById(workoutId);
    recipientUser.sharedWorkouts.push(sharedWorkout);
    await recipientUser.save();

    res.status(200).json({ message: 'Share request accepted successfully' });
  } catch (error) {
    console.error('Error accepting share request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to reject a share request
exports.rejectShare = async (req, res) => {
  const { shareRequestId } = req.body;
  const { user } = req;

  try {
    // Find the share request and update its status to 'rejected'
    const recipientUser = await User.findOne({ email: user.email });
    const shareRequestIndex = recipientUser.shareRequests.findIndex(request => request._id.toString() === shareRequestId);
    if (shareRequestIndex === -1) {
      return res.status(400).json({ error: 'Share request not found' });
    }

    recipientUser.shareRequests[shareRequestIndex].status = 'rejected';
    await recipientUser.save();

    res.status(200).json({ message: 'Share request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting share request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
