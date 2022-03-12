let { MessageEmbed, colors, prefixes, allowedChannels } = require("../required");

module.exports = {
    name: "help",
    aliases: ["h", "help"],
    description: "",
    execute(message) {
        let prefix = prefixes.get(message.guild.id);
        let allowedChannel = allowedChannels.get(message.guild.id);
        let channel = allowedChannel == null ? "**every**" : `<#${allowedChannel}>`;
        let embed = new MessageEmbed()
            .setTitle("Commands")
            .setDescription(`Prefix: **${prefix}** | Allowed channel: ${channel}`)
            .addFields(
                { name: `${prefix}join/j `, value: "Bot enters in the voice channel.", inline: true },
                { name: `${prefix}leave/l`, value: "Bot leaves from the voice channel.", inline: true },
                { name: `${prefix}play/p`, value: "Play/Add a song via link, keywords or play a custom playlist via link.", inline: true },
                { name: `${prefix}search/sr`, value: "Search vie keyword/s.", inline: true },
                { name: `${prefix}skip/s`, value: "Skip the song.", inline: true },
                { name: `${prefix}remove/r`, value: "Remove a song via position.", inline: true },
                { name: `${prefix}pause`, value: "Pause the queue.", inline: true },
                { name: `${prefix}resume`, value: "Resume the queue.", inline: true },
                { name: `${prefix}loop`, value: " Loop the queue.", inline: true },
                { name: `${prefix}queue/q`, value: "Show the queue.", inline: true },
                { name: `${prefix}clear/c`, value: "Clear the queue.", inline: true },
                { name: `${prefix}np`, value: "Show the song that is playing now.", inline: true },
                { name: `${prefix}ach`, value: "Change allowed channel (admin's only).", inline: true },
                { name: `${prefix}prefix`, value: "Change prefix (admin's only).", inline: true },
                { name: `${prefix}fskip/fs`, value: "Force skip (admin's only).", inline: true },
                { name: `${prefix}fleave/fl;`, value: "Force leave (admin's only).", inline: true },
                { name: `${prefix}floop`, value: "Force loop (admin's only).", inline: true },
                { name: `${prefix}fremove/fr`, value: "Force remove (admin's only).", inline: true },
                { name: `${prefix}fpause`, value: "Force pause (admin's only).", inline: true },
                { name: `${prefix}fresume`, value: "Force resume (admin's only).", inline: true },
                { name: `${prefix}volume/v`, value: "Change volume[0%-150%] (admin's only).", inline: true },
            )
            .setColor(colors.queue);
        message.channel.send(embed);
    },
};