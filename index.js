/* eslint-disable no-undef */
let { Client, MessageEmbed, Collection } = require("discord.js");
let client = new Client();
client.commands = new Collection();
const { Sequelize } = require("sequelize");
let fs = require("fs");
let moment = require("moment-timezone");
let colors = require("./settings/color.json");
require("dotenv").config();

const sequelize = new Sequelize(process.env.db_database, process.env.db_username, process.env.db_password, {
    host: "postgres",
    dialect: "postgres",
    logging: false,
    timezone: process.env.timezone
});

async function dbConn() {
    try {
        await sequelize.authenticate();
        console.log(`Connected to ${process.env.db_database}@${process.env.db_host}`);
        client.login(process.env.token);
    } catch (error) {
        dbConn();
        console.error(error);
    }
}

dbConn();

exports.sequelize = sequelize;
exports.conn = dbConn;

let Guilds = require("./db_models/Guilds");
let Songs = require("./db_models/Songs");

let prefixes = new Map();
let allowedChannels = new Map();
let search = new Map();

exports.prefixes = prefixes;
exports.allowedChannels = allowedChannels;
exports.search = search;

client.on("ready", async () => {
    await Songs.sync();
    await Guilds.sync();
    let guilds = client.guilds.cache;

    guilds.map(async g => {
        let found = await Guilds.findOrCreate({
            where: { guildId: g.id },
            defaults: {
                prefix: "!"
            },
            raw: true
        });

        found = found[0];

        prefixes.set(g.id, found.prefix);
        allowedChannels.set(g.id, found.botChannel);

        let bot = g.members.cache.find(m => m.id == client.user.id);
        bot.setNickname(`${found.prefix}h ${client.user.username}`);

    });
    console.log(`${client.user.username}#${client.user.discriminator} ready!`);
    client.user.setPresence({ activity: { name: "Tag me to get info!" } });
});

let players = require("./modules/players");

function sendAndDelete(message, embed) {
    message.channel.send(embed).then(msg => {
        setTimeout(() => {
            message.delete();
            msg.delete();
        }, process.env.delay * 1000);
    });
}

exports.sendAndDelete = sendAndDelete;
exports.client = client;

const commandDirs = fs.readdirSync("./commands").filter(d => {
    if (fs.lstatSync(`./commands/${d}`).isDirectory()) {
        return d;
    }
});

for (const dir of commandDirs) {
    const commandFiles = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${dir}/${file}`);
        client.commands.set(command.aliases, command);
    }
}

client.on("message", async message => {
    if (message.author.bot) return;
    if (message.guild == null) return;
    let prefix = prefixes.get(message.guild.id);
    let allowedChannel = allowedChannels.get(message.guild.id);
    let channel = allowedChannel == null ? "**every**" : `<#${allowedChannel}>`;

    if (message.mentions.has(client.user.id)) {
        let embed = new MessageEmbed()
            .setTitle("Information")
            .setDescription(`Use **${prefix}help** or **${prefix}h** for help! Allowed channel: ${channel}!`)
            .setColor(colors.info);
        sendAndDelete(message, embed);
        return;
    }

    const arg = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = arg.shift().toLowerCase();

    if (!message.content.startsWith(prefix)) return;
    if (!client.commands.find(command => command.aliases.includes(cmd))) return;

    if (allowedChannel !== null) {
        if (allowedChannel !== message.channel.id) {
            let embed = new MessageEmbed()
                .setTitle("This channel is forbidden!")
                .setDescription(`Use ${channel}!`)
                .setColor(colors.warning);
            sendAndDelete(message, embed);
            return;
        }
    }

    let roles = message.member._roles;
    let dj_role = message.guild.roles.cache.find(x => x.name.toLowerCase() == "dj").id;
    let admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");

    if (roles.includes(dj_role) || admin) {
        try {
            client.commands.find(command => command.aliases.includes(cmd)).execute(message, arg);
        } catch (error) {
            console.error(error);
            let embed = new MessageEmbed()
                .setTitle("Command not found or something went wrong!")
                .setColor(colors.warning);
            sendAndDelete(message, embed);
        }
    } else {
        let embed = new MessageEmbed()
            .setTitle("You don't have permissions! Role **DJ**")
            .setColor(colors.warning);
        sendAndDelete(message, embed);
    }
});

setInterval(() => {
    players.autoLeave();
}, 5 * 60 * 1000);

client.on("voiceStateUpdate", (oldMember, newMember) => {
    if (newMember.id == client.user.id && newMember.channelID == null) {
        players.filter(oldMember);
        for (const [key, value] of search) {
            if (key.guildId == newMember.guild.id) {
                search.delete(key);
            }
        }
    }
});

client.on("guildCreate", (guild) => {
    let djRole = null;
    let dj_role = guild.roles.cache.find(x => x.name.toLowerCase() == "dj");

    if (dj_role == undefined) {
        guild.roles.create({
            data: {
                name: "DJ",
                color: "RED",
                mentionable: true
            }
        }).then(res => {
            djRole = res.id;
        }).catch(err => console.log(err));
    } else {
        djRole = dj_role.id;
    }

    Guilds.findOrCreate({
        where: { guildId: guild.id },
        defaults: {
            guildId: guild.id,
            botChannel: null,
            djRole: djRole,
            createdAt: moment().tz(process.env.timezone).format().toString()
        }
    }).then(res => {
        let channelInfo = null;
        let channels = guild.channels.cache;

        prefixes.set(guild.id, "!");
        allowedChannels.set(guild.id, null);

        for (const key of channels) {
            let ch = key;
            if (ch[1].type == "text") {
                channelInfo = ch[1].id;
                break;
            }
        }

        let channel = guild.channels.cache.get(guild.systemChannelID || channelInfo);
        channel.send(`Hi, by default you can use my commands in every channel but you must have <@&${djRole}>! For help use !h or tag me!`);

        let bot = guild.members.cache.find(m => m.id == client.user.id);
        bot.setNickname(`!h ${client.user.username}`);
    }).catch(e => {
        throw e;
    });
});

client.on("guildDelete", (guild) => {
    Guilds.destroy({
        where: { guildId: guild.id }
    }).then(res => console.log(res));
});

client.on("messageReactionAdd", async (reaction) => {
    let found = players.find(reaction.message);
    if (found !== undefined) {
        if (!reaction.me && reaction.message.id == found.queueMsgId?.id) {
            let queueIndexes = found.queueIndexes;
            let arrPages = found.arrPages;
            let queue = found.queue;
            let queueMsgId = found.queueMsgId;

            let duration = 0;
            found.queue.forEach(s => {
                duration += s.duration / 1000;
            });

            let hour = parseInt(duration / 3600);
            let minutes = parseInt((duration - (hour * 3600)) / 60);
            duration = `${hour < 10 ? `0${hour}` : hour}:${minutes < 10 ? `0${minutes}` : minutes}`;

            let flags = `:sound: ${found.volume * 100}% | Paused: ${found.paused ? ":white_check_mark: " : ":x:"} | Looped: ${found.looped ? ":white_check_mark: " : ":x:"}\n`;
            let embed = new MessageEmbed()
                .setTitle("Queue")
                .setFooter(`Pages: ${arrPages.length} | In queue: ${queue.length} | Duration: ${duration} h/m`);

            if (found.station.length > 0) {
                embed.setColor(colors.radio);
            } else {
                embed.setColor(colors.yt);
            }

            if (reaction._emoji.name == "⬅️") {
                found.page--;

                if (arrPages.includes(found.page)) {
                    queueMsgId.reactions.cache.get("⬅️")?.remove();
                    queueMsgId.reactions.cache.get("➡️")?.remove();

                    for (let i = queueIndexes[found.page]; i < queueIndexes[found.page + 1]; i++) {
                        const s = queue[i];
                        if (i == 0) {
                            if (found.station.length > 0) {
                                flags += `\n**NOW**\n Playing radio ${found.station[0].name.toUpperCase()} \n\n **NEXT**`;
                                flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\`\n`;
                            } else {
                                flags += `\n**NOW**\n (${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\` \n\n **NEXT**`;
                            }
                        } else {
                            flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\`\n`;
                        }
                    }

                    embed.setDescription(flags);
                    queueMsgId.edit(embed).then(msg => {
                        found.queueMsgId = msg;
                        if (arrPages.includes(found.page - 1)) {
                            msg.react("⬅️").then(() => {
                                msg.react("➡️");
                            });
                        } else {
                            msg.react("➡️");
                        }
                    });
                }
            }
            else if (reaction._emoji.name == "➡️") {
                found.page++;

                if (arrPages.includes(found.page)) {
                    queueMsgId.reactions.cache.get("⬅️")?.remove();
                    queueMsgId.reactions.cache.get("➡️")?.remove();

                    if (found.page == arrPages[arrPages.length - 1]) {
                        for (let i = queueIndexes[found.page]; i < queue.length; i++) {
                            const s = queue[i];
                            flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\`\n`;
                        }
                    } else {
                        for (let i = queueIndexes[found.page]; i < queueIndexes[found.page + 1]; i++) {
                            const s = queue[i];
                            flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\`\n`;
                        }
                    }
                    embed.setDescription(flags);
                    queueMsgId.edit(embed).then(msg => {
                        queueMsgId = msg;
                        if (arrPages.includes(found.page + 1)) {
                            msg.react("⬅️").then(() => {
                                msg.react("➡️");
                            });
                        } else {
                            msg.react("⬅️");
                        }
                    });
                }
            }
        }
    }
});



