let { MessageEmbed, colors, players, sendAndDelete } = require("../required");


module.exports = {
    name: "volume",
    aliases: ["volume", "v"],
    description: "",
    execute(message, arg) {
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
                        if (arg.length == 0) {
                            let embed = new MessageEmbed()
                                .setTitle(`Volume ${player.volume * 100}%`)
                                .setColor(colors.info);
                            sendAndDelete(message, embed);
                        } else {
                            if (arg < 0 || arg > 150) {
                                let embed = new MessageEmbed()
                                    .setTitle("Volume must be between 0% and 100% !")
                                    .setColor(colors.warning);
                                sendAndDelete(message, embed);
                            } else {
                                if (player.disp !== null) {
                                    player.disp.setVolume(arg / 100);
                                }

                                player.volume = arg / 100;

                                let embed = new MessageEmbed()
                                    .setTitle(`Volume set to ${arg}%`)
                                    .setColor(colors.info);
                                sendAndDelete(message, embed);
                            }
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