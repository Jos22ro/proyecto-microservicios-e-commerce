const { Sequelize } = require('sequelize');
const Payment = require('./Payment');

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const host = process.env.NODE_ENV === 'development' && !process.env.DATABASE_HOST 
    ? 'localhost' 
    : process.env.DATABASE_HOST || 'db';
    
  const port = process.env.NODE_ENV === 'development' && !process.env.DATABASE_PORT
    ? 5435
    : process.env.DATABASE_PORT || 5432;

  return `postgresql://${process.env.DATABASE_USER || 'payments_user'}:${process.env.DATABASE_PASSWORD || 'payments_password'}@${host}:${port}/${process.env.DATABASE_NAME || 'payments_db'}`;
};

const sequelize = new Sequelize(getDatabaseConfig(), {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const models = {
  Payment: Payment(sequelize)
};

Object.keys(models).forEach(key => {
  if (models[key].associate) {
    models[key].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;