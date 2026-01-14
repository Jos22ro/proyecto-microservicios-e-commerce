const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const OrdersServiceClient = require('../services/ordersService');

class PaymentController {
  constructor() {
    this.ordersService = new OrdersServiceClient();
  }

  async createPayment(req, res) {
    const { order_id, amount } = req.body;
    const userId = req.user.id;

    try {
      // Validate input
      if (!order_id || !amount) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'order_id and amount are required'
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Amount must be a positive number'
        });
      }

      // Generate unique transaction ID
      const transactionId = `txn_${uuidv4()}`;

      // Create payment record with PENDING status
      const payment = await db.Payment.create({
        order_id,
        user_id: userId,
        amount: parseFloat(amount.toFixed(2)),
        status: 'PENDING',
        transaction_id: transactionId
      });

      // Start payment processing simulation
      this.processPayment(payment.id);

      return res.status(201).json({
        success: true,
        data: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          status: payment.status,
          transaction_id: payment.transaction_id,
          created_at: payment.created_at,
          message: 'Payment initiated and is being processed'
        }
      });

    } catch (error) {
      console.error('Error creating payment:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create payment'
      });
    }
  }

  async processPayment(paymentId) {
    try {
      // Simulate bank processing delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payment = await db.Payment.findByPk(paymentId);
      if (!payment) {
        console.error(`Payment ${paymentId} not found during processing`);
        return;
      }

      // Simulate payment result (90% approved, 10% rejected)
      const random = Math.random() * 100;
      const isApproved = random < 90;

      const newStatus = isApproved ? 'APPROVED' : 'REJECTED';

      // Update payment status
      await payment.update({ status: newStatus });

      console.log(`Payment ${paymentId} ${newStatus.toLowerCase()} for order ${payment.order_id}`);

      // Notify Orders Service about the payment result
      await this.notifyOrdersService(payment, newStatus);

    } catch (error) {
      console.error(`Error processing payment ${paymentId}:`, error);
      
      try {
        await db.Payment.update(
          { status: 'REJECTED' },
          { where: { id: paymentId } }
        );
      } catch (updateError) {
        console.error('Failed to update payment status after error:', updateError);
      }
    }
  }

  async notifyOrdersService(payment, paymentStatus) {
    try {
      const orderStatus = paymentStatus === 'APPROVED' ? 'PAID' : 'PAYMENT_FAILED';
      
      const result = await this.ordersService.updateOrderStatus(
        payment.order_id,
        orderStatus,
        payment.id
      );

      if (result.success) {
        console.log(`Successfully updated order ${payment.order_id} status to ${orderStatus}`);
      } else {
        console.error(`Failed to update order ${payment.order_id} status:`, result.error);
      }
    } catch (error) {
      console.error(`Error notifying orders service for payment ${payment.id}:`, error);
    }
  }

  async getUserPayments(req, res) {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const whereClause = { user_id: userId };

      if (status) {
        whereClause.status = status.toUpperCase();
      }

      const { count, rows: payments } = await db.Payment.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          payments: payments.map(payment => ({
            id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount,
            status: payment.status,
            transaction_id: payment.transaction_id,
            created_at: payment.created_at,
            updated_at: payment.updated_at
          })),
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user payments:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch payments'
      });
    }
  }

  async getPaymentById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const payment = await db.Payment.findOne({
        where: {
          id: parseInt(id),
          user_id: userId
        }
      });

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found',
          message: 'Payment does not exist or does not belong to you'
        });
      }

      return res.json({
        success: true,
        data: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          status: payment.status,
          transaction_id: payment.transaction_id,
          created_at: payment.created_at,
          updated_at: payment.updated_at
        }
      });

    } catch (error) {
      console.error('Error fetching payment details:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch payment details'
      });
    }
  }

  async getPaymentStats(req, res) {
    const userId = req.user.id;

    try {
      const stats = await db.Payment.findAll({
        where: { user_id: userId },
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        group: ['status']
      });

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = {
          count: parseInt(stat.dataValues.count),
          total: parseFloat(stat.dataValues.total) || 0
        };
        return acc;
      }, {});

      return res.json({
        success: true,
        data: formattedStats
      });

    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch payment statistics'
      });
    }
  }
}

module.exports = PaymentController;