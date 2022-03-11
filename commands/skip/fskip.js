let { MessageEmbed, colors, players, sendAndDelete } = require("../required");

module.exports = {
    name: "fskip",
    aliases: ["fskip", "fs"],
    description: "",
    async execute(message) {
        let player = players.find(message);
        let admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");

        if (message.member.voice.channel) {
            if (player !== undefined) {
                if (admin) {
                    if (message.member.voice.channel.id !== player.voice && player.conn !== null) {
                        let channel = message.guild.channels.cache.find(c => c.id === player.voice && c.type === "voice");
                        let embed = new MessageEmbed()
                            .setTitle(`Sorry but I'm playing music in ${channel.name.toUpperCase()}!`)
                            .setColor(colors.warning);
                        sendAndDelete(message, embed);
                    } else {
                        if (player.queue.length > 0) {
                            let embed = new MessageEmbed()
                                .setTitle("Song skipped!")
                                .setColor(colors.info);
                            sendAndDelete(message, embed);
                            player.skipCmd();

                        } else {
                            let embed = new MessageEmbed()
                                .setTitle("There is nothing to skip!")
                                .setColor(colors.info);
                            sendAndDelete(message, embed);
                        }
                    }
                } else {
                    let embed = new MessageEmbed()
                        .setTitle("You don't have permissions!")
                        .setColor(colors.warning);
                    sendAndDelete(message, embed);
                }

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