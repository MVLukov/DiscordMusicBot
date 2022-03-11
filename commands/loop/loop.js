let { MessageEmbed, colors, players, sendAndDelete, vote } = require("../required");


module.exports = {
    name: "loop",
    aliases: ["loop"],
    description: "",
    execute(message, arg) {
        let player = players.find(message);

        if (message.member.voice.channel) {
            if (player !== undefined) {
                if (message.member.voice.channel.id !== player.voice && player.conn !== null) {
                    let channel = message.guild.channels.cache.find(c => c.id === player.voice && c.type === "voice");
                    let embed = new MessageEmbed()
                        .setTitle(`Sorry but I'm playing music in ${channel.name.toUpperCase()}!`)
                        .setColor(colors.warning);
                    sendAndDelete(message, embed);
                } else {
                    if (player.queue.length > 0) {
                        if (!player.loopVote) {
                            vote(message, "loop", player, arg);
                        } else {
                            let embed = new MessageEmbed()
                                .setTitle("There is another vote already!")
                                .setColor(colors.warn);
                            sendAndDelete(message, embed);
                        }
                    }
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