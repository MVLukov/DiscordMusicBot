let { MessageEmbed, colors, sendAndDelete, Guilds, allowedChannels } = require("../required");

module.exports = {
    name: "ach",
    aliases: ["ach"],
    description: "",
    execute(message, arg) {
        let admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
        if (admin) {
            if (arg.length > 0) {
                let mention = arg[0];

                if (mention.startsWith("<#") && mention.endsWith(">")) {
                    mention = mention.slice(2, -1);

                    if (mention.startsWith("!")) {
                        mention = mention.slice(1);
                    }


                    Guilds.update({ botChannel: mention }, {
                        where: {
                            guildId: message.guild.id
                        }
                    }).then(res => {
                        if (res[0]) {
                            allowedChannels.delete(message.guild.id);
                            allowedChannels.set(message.guild.id, mention);
                            let embed = new MessageEmbed()
                                .setTitle("Allowed channel changed!")
                                .setDescription(`<#${mention}>`)
                                .setColor(colors.info);
                            sendAndDelete(message, embed);
                        }
                    }).catch(e => {
                        throw e;
                    });
                } else {
                    let embed = new MessageEmbed()
                        .setTitle("Please provide a channel!")
                        .setColor(colors.warn);
                    sendAndDelete(message, embed);
                }
            } else {
                let embed = new MessageEmbed()
                    .setTitle("Please provide a channel!")
                    .setColor(colors.warn);
                sendAndDelete(message, embed);
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("You don't have permissions!")
                .setColor(colors.warn);
            sendAndDelete(message, embed);
        }
    }
};