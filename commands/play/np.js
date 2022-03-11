let { MessageEmbed, colors, players, sendAndDelete } = require("../required");


module.exports = {
    name: "now playing",
    aliases: ["np"],
    description: "",
    execute(message) {
        let player = players.find(message);

        if (message.member.voice.channel) {
            if (player !== undefined) {
                player.np();
            } else {
                let embed = new MessageEmbed()
                    .setTitle("Bot is not in voice channel!")
                    .setColor(colors.warning);
                sendAndDelete(message, embed);
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("You are not in voice channel!")
                .setColor(colors.warning);
            sendAndDelete(message, embed);
        }
    },
};