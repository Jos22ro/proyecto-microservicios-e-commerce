const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const PaymentController = require('../controllers/paymentController');

const router = express.Router();
const paymentController = new PaymentController();

// POST /payments - Create new payment
router.post('/', authenticateToken, paymentController.createPayment.bind(paymentController));

// GET /payments - Get user payments with pagination
router.get('/', authenticateToken, paymentController.getUserPayments.bind(paymentController));

// GET /payments/stats - Get payment statistics for user
router.get('/stats', authenticateToken, paymentController.getPaymentStats.bind(paymentController));

// GET /payments/:id - Get specific payment details
router.get('/:id', authenticateToken, paymentController.getPaymentById.bind(paymentController));

module.exports = router;