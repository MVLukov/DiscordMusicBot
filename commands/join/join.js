let { MessageEmbed, colors, players, sendAndDelete, Dispatcher } = require("../required");

module.exports = {
    name: "join",
    aliases: ["join", "j"],
    description: "",
    execute(message) {
        if (message.member.voice.channel) {
            let player = players.find(message);
            if (player == undefined) {
                players.push({
                    id: message.guild.id,
                    player: new Dispatcher(message, message.member.voice.channel.id)
                });
                player = players.find(message);
                player.join();
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("You are not in voice channel!")
                .setColor(colors.warning);
            sendAndDelete(message, embed);
        }
    },
};