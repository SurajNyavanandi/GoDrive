const Item = require('../models/Item');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const mongoose = require('mongoose');

// In-memory fallback dataset for smooth instant testing when MongoDB is offline
let mockItems = [
  {
    _id: 'mock_item_1',
    title: 'Initialize Client Application',
    description: 'Setup full-stack environment variables and dependencies.',
    category: 'Development',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock_item_2',
    title: 'Configure Email & SMS Keys',
    description: 'Add Resend and MSG91 API credentials into .env configuration.',
    category: 'Integrations',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock_item_3',
    title: 'Setup Razorpay Test Mode',
    description: 'Test end-to-end checkout with mock payments in sandbox.',
    category: 'Payments',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Get all items with optional query search & pagination
 * GET /api/items
 */
const getItems = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const search = req.query.q ? String(req.query.q).trim() : '';
  const category = req.query.category;

  if (!isDbConnected) {
    let filtered = [...mockItems];
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return successResponse(
      res,
      {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        simulated: true,
      },
      'Items retrieved (mock offline dataset)',
      200
    );
  }

  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) {
    query.category = category;
  }

  const total = await Item.countDocuments(query);
  const items = await Item.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return successResponse(
    res,
    {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
    'Items retrieved successfully',
    200
  );
});

/**
 * Get single item by ID
 * GET /api/items/:id
 */
const getItemById = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;

  if (!isDbConnected) {
    const item = mockItems.find((i) => i._id === id);
    if (!item) {
      return errorResponse(res, 'Item not found', 404);
    }
    return successResponse(res, { item }, 'Item retrieved', 200);
  }

  const item = await Item.findById(id);
  if (!item) {
    return errorResponse(res, 'Item not found', 404);
  }

  return successResponse(res, { item }, 'Item retrieved successfully', 200);
});

/**
 * Create a new item
 * POST /api/items
 */
const createItem = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { title, description, category, status } = req.body;

  if (!title) {
    return errorResponse(res, 'Please provide an item title', 400);
  }

  if (!isDbConnected) {
    const newItem = {
      _id: `mock_item_${Date.now()}`,
      title,
      description: description || '',
      category: category || 'General',
      status: status || 'active',
      user: req.user?._id || 'mock_user_id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockItems.unshift(newItem);
    return successResponse(res, { item: newItem }, 'Item created (mock mode)', 201);
  }

  const item = await Item.create({
    title,
    description,
    category,
    status,
    user: req.user?._id,
  });

  return successResponse(res, { item }, 'Item created successfully', 201);
});

/**
 * Update an existing item
 * PUT /api/items/:id
 */
const updateItem = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;

  if (!isDbConnected) {
    const idx = mockItems.findIndex((i) => i._id === id);
    if (idx === -1) {
      return errorResponse(res, 'Item not found', 404);
    }
    mockItems[idx] = { ...mockItems[idx], ...req.body, updatedAt: new Date().toISOString() };
    return successResponse(res, { item: mockItems[idx] }, 'Item updated (mock mode)', 200);
  }

  const item = await Item.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    return errorResponse(res, 'Item not found', 404);
  }

  return successResponse(res, { item }, 'Item updated successfully', 200);
});

/**
 * Delete an item
 * DELETE /api/items/:id
 */
const deleteItem = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;

  if (!isDbConnected) {
    mockItems = mockItems.filter((i) => i._id !== id);
    return successResponse(res, { deletedId: id }, 'Item deleted (mock mode)', 200);
  }

  const item = await Item.findByIdAndDelete(id);
  if (!item) {
    return errorResponse(res, 'Item not found', 404);
  }

  return successResponse(res, { deletedId: id }, 'Item deleted successfully', 200);
});

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
