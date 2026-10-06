const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { validate, z } = require('../middleware/validateMiddleware');

// Zod validation schemas
const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  category: z.string().max(50).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
});

const updateItemSchema = createItemSchema.partial();

// Routes
router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', protect, validate(createItemSchema), createItem);
router.put('/:id', protect, validate(updateItemSchema), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
