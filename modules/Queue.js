let { MessageEmbed } = require("discord.js");
let Player = require("./Player");
let colors = require("../settings/color.json");
let moment = require("moment-timezone");
require("dotenv").config();

class Queue extends Player {
    constructor(message, voice) {
        super(message, voice);
        this.queue = [];
        this.arrPages = [];
        this.queueIndexes = [];
        this.queueMsgId = "";
        this.page = 0;
        this.station = [];
    }

    queueCmd() {
        let pages = Math.ceil(this.queue.length / 6);
        let flags = `:sound: ${this.volume * 100}% | Paused: ${this.paused ? ":white_check_mark: " : ":x:"} | Looped: ${this.looped ? ":white_check_mark: " : ":x:"}\n`;

        let duration = 0;
        this.queue.forEach(s => {
            duration += s.duration / 1000;
        });
        let hour = parseInt(duration / 3600);
        let minutes = parseInt((duration - (hour * 3600)) / 60);


        let embed = new MessageEmbed()
            .setTitle("Queue")
            .setFooter(`Pages: ${pages} | Songs in queue: ${this.queue.length} | Duration: ${hour < 10 ? `0${hour}` : hour}:${minutes < 10 ? `0${minutes}` : minutes} h/m`);

        if (this.queue.length > 6) {
            for (let i = 0; i < pages; i++) {
                this.arrPages.push(i);
            }

            for (let i = 0; i < this.queue.length; i += 6) {
                const chunk = this.queue.slice(i, i + 6);
                this.queueIndexes.push(chunk[0].position - 1);
            }

            for (let i = 0; i < this.queueIndexes[1]; i++) {
                const s = this.queue[i];
                if (i == 0) {
                    if (this.station.length > 0) {
                        embed.setColor(colors.radio);
                        flags += `\n**NOW**\n Playing radio ${this.station[0].name.toUpperCase()} \n\n **NEXT**`;
                        flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} \n\`${s.userId}\`\n`;
                    } else {
                        embed.setColor(colors.yt);
                        flags += `\n**NOW**\n (${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\` \n\n **NEXT**`;
                    }
                } else {
                    if (this.station.length > 0) {
                        flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} \n\`${s.userId}\`\n`;
                    } else {
                        flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\`\n`;
                    }
                }
            }

            embed.setDescription(flags);
            this.message.channel.send(embed).then(msg => {
                this.queueMsgId = msg;
                msg.react("🎵").then(() => {
                    msg.react("➡️");
                });
            });
        } else if (this.queue.length > 0) {
            for (let i = 0; i < this.queue.length; i++) {
                const s = this.queue[i];
                if (i == 0) {
                    if (this.station.length > 0) {
                        embed.setColor(colors.radio);
                        flags += `\n**NOW**\n Playing radio ${this.station[0].name.toUpperCase()} \n\n **In queue**`;
                        flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} \n\`${s.userId}\`\n`;
                    } else {
                        embed.setColor(colors.yt);
                        if (this.queue.length > 1) {
                            flags += `\n**NOW**\n (${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\` \n\n **NEXT**`;
                        } else {
                            flags += `\n**NOW**\n (${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\``;
                        }

                    }
                } else {
                    if (this.station.length > 0) {
                        flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} \n\`${s.userId}\`\n`;
                    } else {
                        flags += `\n(${s.position}) [${s.title}](${s.url}) - ${s.durationFormatted} - [${s.startsAt} - ${s.endsAt}] \n\`${s.userId}\`\n`;
                    }
                }
            }

            embed.setDescription(flags);
            this.message.channel.send(embed);
        } else {
            let embed = new MessageEmbed()
                .setTitle("The queue is empty!")
                .setColor(colors.warning);
            this.send(embed);
        }
    }

    emptyQueueStuff() {
        this.arrPages = [];
        this.queueIndexes = [];
        this.queueMsgId = "";
        this.page = 0;
    }

    addQueue(song, position) {
        song.title = song.title.replace(/ *\([^)]*\) */g, "");
        song.title = song.title.replace(/ *\[[^\]]*]/, "");

        if (this.queue.length == 0) {
            let start = moment().tz(process.env.timezone);
            let hourStart = start.hours() < 10 ? `0${start.hours()}` : start.hours();
            let minutesStart = start.minutes() < 10 ? `0${start.minutes()}` : start.minutes();

            let end = moment().tz(process.env.timezone).add(song.duration / 1000, "seconds");
            let hourEnd = end.hours() < 10 ? `0${end.hours()}` : end.hours();
            let minutesEnd = end.minutes() < 10 ? `0${end.minutes()}` : end.minutes();

            this.queue.push({
                position: position,
                url: `https://www.youtube.com/watch?v=${song.id}`,
                title: song.title,
                views: song.views,
                duration: song.duration,
                durationFormatted: song.durationFormatted,
                description: song.description,
                thumbnail: song.thumbnail.url,
                userId: `${this.message.member.user.username}#${this.message.member.user.discriminator}`,
                startsAt: `${hourStart}:${minutesStart}`,
                endsAt: `${hourEnd}:${minutesEnd}`
            });
        } else {
            let lastItem = this.queue[this.queue.length - 1];
            let lastItemArr = lastItem.endsAt.split(":");

            let start = moment().tz(process.env.timezone).set({ hour: lastItemArr[0], minutes: lastItemArr[1] });
            let hourStart = start.hours() < 10 ? `0${start.hours()}` : start.hours();
            let minutesStart = start.minutes() < 10 ? `0${start.minutes()}` : start.minutes();

            let end = moment(start).tz(process.env.timezone).add(song.duration / 1000, "seconds");
            let hourEnd = end.hours() < 10 ? `0${end.hours()}` : end.hours();
            let minutesEnd = end.minutes() < 10 ? `0${end.minutes()}` : end.minutes();

            this.queue.push({
                position: position,
                url: `https://www.youtube.com/watch?v=${song.id}`,
                title: song.title,
                views: song.views,
                duration: song.duration,
                durationFormatted: song.durationFormatted,
                description: song.description,
                thumbnail: song.thumbnail.url,
                userId: `${this.message.member.user.username}#${this.message.member.user.discriminator}`,
                startsAt: `${hourStart}:${minutesStart}`,
                endsAt: `${hourEnd}:${minutesEnd}`
            });
        }
    }

    orderQueue() {
        let arr = [];
        for (let i = 0; i < this.queue.length; i++) {
            let x = this.queue[i];

            if (arr.length == 0) {
                if (this.station.length > 0) {
                    let start = moment().tz(process.env.timezone);
                    let hourStart = start.hours() < 10 ? `0${start.hours()}` : start.hours();
                    let minutesStart = start.minutes() < 10 ? `0${start.minutes()}` : start.minutes();

                    let end = moment().tz(process.env.timezone).add(x.duration / 1000, "seconds");
                    let hourEnd = end.hours() < 10 ? `0${end.hours()}` : end.hours();
                    let minutesEnd = end.minutes() < 10 ? `0${end.minutes()}` : end.minutes();

                    arr.push({
                        ...x,
                        position: 1,
                        startsAt: `${hourStart}:${minutesStart}`,
                        endsAt: `${hourEnd}:${minutesEnd}`
                    });
                } else {
                    arr.push({ ...x, position: 1 });
                }
            } else {
                let lastItem = arr[arr.length - 1];
                let lastItemArr = lastItem.endsAt.split(":");

                let start = moment().tz(process.env.timezone).set({ hour: lastItemArr[0], minutes: lastItemArr[1] });
                let hour = start.hours() < 10 ? `0${start.hours()}` : start.hours();
                let minutes = start.minutes() < 10 ? `0${start.minutes()}` : start.minutes();

                let end = moment(start).tz(process.env.timezone).add(x.duration / 1000, "seconds");
                let hourEnd = end.hours() < 10 ? `0${end.hours()}` : end.hours();
                let minutesEnd = end.minutes() < 10 ? `0${end.minutes()}` : end.minutes();

                arr.push({ ...x, position: i + 1, startsAt: `${hour}:${minutes}`, endsAt: `${hourEnd}:${minutesEnd}` });
            }
        }
        this.queue = arr;
    }

    np() {
        if (this.station.length > 0) {
            let embed = new MessageEmbed()
                .setTitle(`Now playing radio ${this.station[0].name.toUpperCase()}`)
                .setColor(colors.radio);
            this.send(embed);
        } else if (this.queue.length > 0) {
            let embed = new MessageEmbed()
                .setTitle(`Now playing ${this.queue[0].title}`)
                .setColor(colors.yt);
            this.send(embed);
        }
    }
}

module.exports = Queue;