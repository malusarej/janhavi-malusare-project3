const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const shareController = require('../controllers/shareController');

router.use(requireAuth);

// POST route to send a sharing request
router.post('/request', shareController.requestShare); // <-- Corrected function name here

module.exports = router;

