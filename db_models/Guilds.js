const {sequelize} = require("../index");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("Guilds", {
    guildId: {
        type: DataTypes.STRING,
        required: true
    },
    prefix: {
        type: DataTypes.STRING,
        defaultValue: "!"
    },
    djRole: {
        type: DataTypes.STRING,
        default: null
    },
    botChannel: {
        type: DataTypes.STRING,
        default: null
    },
    createdAt: {
        type: DataTypes.STRING,
        required: true
    }
}, { timestamps: false, createdAt: false, updatedAt: false });
