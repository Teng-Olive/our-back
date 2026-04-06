import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const OrderModel = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    address: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Order placed',
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    date: {
        type: DataTypes.BIGINT,
        defaultValue: () => Date.now(),
    }
}, {
    timestamps: true,
    tableName: 'orders'
});

// Define association
OrderModel.belongsTo(User, { foreignKey: 'userId' });

export default OrderModel;
