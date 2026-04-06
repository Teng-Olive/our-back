import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: true,
            underscored: false,
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ MySQL database connection established successfully');
        
        await sequelize.sync({ alter: false });
        console.log('✓ Database synchronized');
        
    } catch (error) {
        console.error('✗ Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

export { sequelize, connectDB };