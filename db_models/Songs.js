const { sequelize } = require("../index");
const { DataTypes } = require("sequelize");

module.exports = sequelize.define("Songs", {
    guildId: {
        type: DataTypes.STRING,
        required: true
    },
    songName: {
        type: DataTypes.STRING,
        required: true
    },
    songUrl: {
        type: DataTypes.STRING,
        required: true
    },
    playCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    lastPlayedByName: {
        type: DataTypes.STRING,
        required: true
    },
    lastPlayedById: {
        type: DataTypes.STRING,
        required: true
    },
    lastPlayedAt: {
        type: DataTypes.STRING,
        required: true
    },
    createdAt: {
        type: DataTypes.STRING,
        required: true
    }
}, { timestamps: false, createdAt: false, updatedAt: false });
