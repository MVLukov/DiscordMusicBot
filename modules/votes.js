let { MessageEmbed } = require("discord.js");
let colors = require("../settings/color.json");
let { sendAndDelete } = require("../index");

module.exports = async (message, title, player, arg) => {
    switch (title.toLowerCase()) {
        case "skip":
            player.skipVote = true;
            break;
        case "remove":
            player.removeVote = true;
            break;
        case "pause":
            player.pauseVote = true;
            break;
        case "resume":
            player.resumeVote = true;
            break;
        case "loop":
            player.loopVote = true;
            break;
        case "clear":
            player.clearVote = true;
            break;
        case "leave":
            player.leaveVote = true;
            break;
    }

    let embed = new MessageEmbed()
        .setTitle(`Vote to ${title}!`)
        .setColor(colors.info);



    let voiceChannel = await player.conn.player.voiceConnection.channel.id;
    let dj_role = message.guild.roles.cache.find(x => x.name.toLowerCase() == "dj").id;

    let reacted = [];
    let withoutRoles = [];
    let yes = 0;

    let channels = message.guild.channels.cache.find(c => c.id === voiceChannel && c.type === "voice");
    channels.members.map(x => {
        let roles = message.guild.member(x.user)._roles;
        if (!roles.includes(dj_role) || x.user.bot) {
            if (!withoutRoles.includes(x.user.username)) {
                withoutRoles.push(x.user.username);
            }
        } else {
            withoutRoles = withoutRoles.filter(i => i !== x.user.username);
        }
    });

    let votesNeeded = parseInt(Math.ceil((channels.members.size - withoutRoles.length) * (2 / 3)));
    if (votesNeeded == 0) {
        switch (title.toLowerCase()) {
            case "skip":
                player.skipVote = false;
                break;
            case "remove":
                player.removeVote = false;
                break;
            case "pause":
                player.pauseVote = false;
                break;
            case "resume":
                player.resumeVote = false;
                break;
            case "loop":
                player.loopVote = false;
                break;
            case "clear":
                player.clearVote = false;
                break;
            case "leave":
                player.leaveVote = false;
                break;
        }

        switch (title.toLowerCase()) {
            case "skip":
                player.skipCmd();
                break;
            case "remove":
                player.removeCmd(parseInt(arg));
                break;
            case "pause":
                player.pauseCmd();
                break;
            case "resume":
                player.resumeCmd();
                break;
            case "loop":
                player.loopCmd();
                break;
            case "clear":
                player.clearCmd();
                break;
            case "leave":
                player.leave();
                break;
        }
        return;
    }

    const pollTopic = await message.channel.send(embed);
    await pollTopic.react("👍");

    const filter = (reaction) => reaction.emoji.name === "👍";
    const collector = pollTopic.createReactionCollector(filter, { time: 25000, dispose: true });

    collector.on("collect", (reaction, user) => {
        let roles = message.guild.member(user)._roles;
        if (roles.includes(dj_role) && !user.bot) {
            if (!reacted.includes(user.username)) {
                reacted.push(user.username);
                withoutRoles = withoutRoles.filter(i => i !== user.username);
                if (reaction.emoji.name == "👍") yes++;
            } else {
                reaction.users.remove(user);
            }
        } else {
            if (!withoutRoles.includes(user.username)) {
                withoutRoles.push(user.username);
            }
            reaction.users.remove(user);
        }

        let channels = reaction.message.guild.channels.cache.find(c => c.id === voiceChannel && c.type === "voice");
        channels.members.map(x => {
            let roles = message.guild.member(x.user)._roles;
            if (!roles.includes(dj_role) || x.user.bot) {
                if (!withoutRoles.includes(x.user.username)) {
                    console.log(x.user.username);
                    withoutRoles.push(x.user.username);
                }
            } else {
                withoutRoles = withoutRoles.filter(i => i !== x.user.username);
            }
        });

        let votesNeeded = parseInt(Math.ceil((channels.members.size - withoutRoles.length) * (2 / 3)));
        if (votesNeeded === 0) {
            collector.stop();
        }

        let embed = new MessageEmbed()
            .setTitle(`Vote to ${title} ${yes}/${votesNeeded}!`)
            .setColor(colors.info);
        pollTopic.edit(embed);

        if (yes >= votesNeeded) {
            collector.stop();
        }
    });

    collector.on("remove", (reaction, user) => {
        reacted = reacted.filter(i => i !== user.username);
        if (reaction.emoji.name == "👍") yes--;

        let channels = reaction.message.guild.channels.cache.find(c => c.id === voiceChannel && c.type === "voice");
        channels.members.map(x => {
            let roles = message.guild.member(x.user)._roles;
            if (!roles.includes(dj_role) || x.user.bot) {
                if (!withoutRoles.includes(x.user.username)) {
                    withoutRoles.push(x.user.username);
                }
            } else {
                withoutRoles = withoutRoles.filter(i => i !== x.user.username);
            }
        });

        let votesNeeded = parseInt(Math.ceil((channels.members.size - withoutRoles.length) * (2 / 3)));
        let embed = new MessageEmbed()
            .setTitle(`Vote to skip ${yes}/${votesNeeded}!`)
            .setColor(colors.info);
        pollTopic.edit(embed);

    });

    collector.on("end", () => {
        switch (title.toLowerCase()) {
            case "skip":
                player.skipVote = false;
                break;
            case "remove":
                player.removeVote = false;
                break;
            case "pause":
                player.pauseVote = false;
                break;
            case "resume":
                player.resumeVote = false;
                break;
            case "loop":
                player.loopVote = false;
                break;
            case "clear":
                player.clearVote = false;
                break;
            case "leave":
                player.leaveVote = false;
                break;
        }

        let channels = message.guild.channels.cache.find(c => c.id === voiceChannel && c.type === "voice");
        channels.members.map(x => {
            let roles = message.guild.member(x.user)._roles;
            if (!roles.includes(dj_role) || x.user.bot) {
                if (!withoutRoles.includes(x.user.username)) {
                    withoutRoles.push(x.user.username);
                }
            } else {
                withoutRoles = withoutRoles.filter(i => i !== x.user.username);
            }
        });

        let votesNeeded = parseInt(Math.ceil((channels.members.size - withoutRoles.length) * (2 / 3)));
        if (yes >= votesNeeded) {
            let embed = new MessageEmbed()
                .setTitle(`Vote ended by ${yes}/${votesNeeded}!`)
                .setColor(colors.info);
            sendAndDelete(pollTopic, embed);
            switch (title.toLowerCase()) {
                case "skip":
                    player.skipCmd();
                    break;
                case "remove":
                    player.removeCmd(parseInt(arg));
                    break;
                case "pause":
                    player.pauseCmd();
                    break;
                case "resume":
                    player.resumeCmd();
                    break;
                case "loop":
                    player.loopCmd();
                    break;
                case "clear":
                    player.clearCmd();
                    break;
                case "leave":
                    player.leave();
                    break;
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle(`${votesNeeded - yes} vote/s needed!`)
                .setColor(colors.info);
            sendAndDelete(pollTopic, embed);
        }
    });
};