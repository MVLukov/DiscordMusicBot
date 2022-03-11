let { MessageEmbed, colors, sendAndDelete, Guilds, client, prefixes } = require("../required");

module.exports = {
    name: "prefix",
    aliases: ["prefix"],
    description: "",
    execute(message, arg) {
        let admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
        if (admin) {
            if (arg.length > 0) {
                Guilds.update({ prefix: arg[0] }, {
                    where: { guildId: message.guild.id }
                }).then(res => {
                    if (res[0]) {
                        let embed = new MessageEmbed()
                            .setTitle(`Prefix changed to **${arg[0]}**`)
                            .setColor(colors.info);
                        sendAndDelete(message, embed);

                        prefixes.delete(message.guild.id);
                        prefixes.set(message.guild.id, arg[0]);

                        let bot = message.guild.members.cache.find(m => m.id == client.user.id);
                        bot.setNickname(`${arg[0]}h ${client.user.username}`);
                    }
                });
            } else {
                let embed = new MessageEmbed()
                    .setTitle("Please provide a prefix!")
                    .setColor(colors.warning);
                sendAndDelete(message, embed);
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("You don't have permissions!")
                .setColor(colors.warning);
            sendAndDelete(message, embed);
        }
    },
};