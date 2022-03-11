// const { Sequelize } = require("sequelize");
// require("dotenv").config();

// const sequelize = new Sequelize(process.env.db_database, process.env.db_username, process.env.db_password, {
//     host: "postgres",
//     dialect: "postgres",
//     logging: false
// });

// exports.sequelize = sequelize;
// exports.dbConn = async () => {
//     try {
//         await sequelize.authenticate();
//         return true;
//     } catch (error) {
//         console.error(error);
//     }
// };