const express = require('express');
const router = express.Router();
const {
  getMySections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} = require('../controllers/sectionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getMySections);
router.post('/', createSection);
router.put('/reorder', reorderSections);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

module.exports = router;
