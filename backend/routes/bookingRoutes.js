const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { validate } = require('../middleware/validateMiddleware');
const { bookingCreateSchema, bookingQuerySchema } = require('../middleware/schemas');

router.post('/', validate(bookingCreateSchema, 'body'), bookingController.createBookingHandler);
router.get('/', validate(bookingQuerySchema, 'query'), bookingController.getBookingsHandler);

module.exports = router;
