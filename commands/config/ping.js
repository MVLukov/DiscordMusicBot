let { MessageEmbed, colors, sendAndDelete, client } = require("../required");

module.exports = {
    name: "ping",
    aliases: ["ping"],
    description: "",
    execute(message) {
        let embed = new MessageEmbed()
            .setTitle(`Ping is ${client.ws.ping}ms`)
            .setColor(colors.info);
        sendAndDelete(message,embed);
    }
};