let { MessageEmbed, colors, prefixes, search, sendAndDelete } = require("../required");
const YouTube = require("youtube-sr").default;

module.exports = {
    name: "search",
    aliases: ["search", "sr"],
    description: "",
    execute(message, arg) {
        let prefix = prefixes.get(message.guild.id);
        if (arg.length > 0) {
            let embed = new MessageEmbed()
                .setTitle(`Search results for ${arg.join(" ").toUpperCase()}`)
                .setColor(colors.info);
            YouTube.search(arg.join(" "), { limit: 10 }).then(res => {
                let description = "";
                for (const [key, value] of search) {
                    if (key.guildId == message.guild.id) {
                        search.delete(key);
                    }
                }

                res.forEach((s, i) => {
                    s.title = s.title.replace(/ *\([^)]*\) */g, "");
                    s.title = s.title.replace(/ *\[[^\]]*]/, "");
                    i++;
                    description += `**[${i}]** [${s.title}](${s.url}) - ${s.views} views \nUse ${prefix}play ${i}\n`;
                    let key = { guildId: message.guild.id, i: i };
                    search.set(key, s.url.toString());
                });

                embed.setDescription(description);
                message.channel.send(embed);
            }).catch(e => console.log(e));
        } else {
            let embed = new MessageEmbed()
                .setTitle("Please provide a keyword!")
                .setColor(colors.warning);
            sendAndDelete(message, embed);
        }
    }
};