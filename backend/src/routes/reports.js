const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Allow reporting content (can be anonymous or authenticated)
router.post('/', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, createReport);

module.exports = router;
