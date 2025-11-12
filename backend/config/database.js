const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI, {
        serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
        socketTimeoutMS: 45000,
    }).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
    }).catch(err => {
        console.error('MongoDB connection error:', err.message);
        console.error('Please check:');
        console.error('1. Your internet connection');
        console.error('2. MongoDB Atlas IP whitelist settings');
        console.error('3. Database credentials in .env file');
        process.exit(1);
    })
}

module.exports = connectDatabase

