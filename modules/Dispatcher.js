let { MessageEmbed } = require("discord.js");
const YouTube = require("youtube-sr").default;
let ytdl = require("ytdl-core");
let Queue = require("./Queue");
let colors = require("../settings/color.json");
let Songs = require("../db_models/Songs");
let moment = require("moment-timezone");
let { timezone } = require("../settings/config.json");
let { Op } = require("sequelize");

class Dispatcher extends Queue {
    constructor(message, voice) {
        super(message, voice);
        this.disp = null;
        this.error = 0;
    }

    async Next() {
        this.disp.on("finish", async () => {
            if (this.looped) {
                this.queue.push(this.queue.shift());
            } else {
                this.queue.shift();
            }

            if (this.queue.length > 0) {
                this.orderQueue();
                this.play();
            } else {
                let embed = new MessageEmbed()
                    .setTitle("The queue is empty!")
                    .setColor(colors.warning);
                this.send(embed);
                this.clearCmd();
            }
        });
    }

    async play() {
        await Songs.findOrCreate({
            where: { [Op.and]: [{ guildId: this.message.guild.id }, { songUrl: this.queue[0].url }] },
            defaults: {
                guildId: this.message.guild.id,
                songName: this.queue[0].title,
                songUrl: this.queue[0].url,
                lastPlayedByName: `${this.message.member.user.username}#${this.message.member.user.discriminator}`,
                lastPlayedById: this.message.member.user.id,
                lastPlayedAt: moment().tz(timezone).format().toString(),
                createdAt: moment().tz(timezone).format().toString()
            }
        }).then(async res => {
            if (!res[1]) {
                let playCount = res[0].dataValues.playCount + 1;
                await Songs.update({
                    playCount: playCount,
                    lastPlayedByName: `${this.message.member.user.username}#${this.message.member.user.discriminator}`,
                    lastPlayedById: this.message.member.user.id,
                    lastPlayedAt: moment().tz(timezone).format().toString()
                }, {
                    where: { [Op.and]: [{ guildId: this.message.guild.id }, { songUrl: this.queue[0].url }] }
                });
            }
        });
        this.disp = this.conn.play(ytdl(this.queue[0].url, { filter: "audioonly", type: "opus" }), {
            volume: this.volume
        }).on("error", (e) => {
            console.log(e);
            this.error++;
            if (this.error == 2) {
                this.error = 0;
                if (this.queue.length > 1) {
                    this.embed("Can't play this song right now! Song skipped!", this.queue[0]);
                    this.skipCmd();
                } else {
                    let embed = new MessageEmbed()
                        .setTitle("There was an error playing this so song skipped and queue is empty!")
                        .setColor(colors.warning);
                    this.send(embed);
                    this.clearCmd();
                }
            } else {
                this.play(this.queue[0]);
            }
        });

        this.Next();
    }

    async playCmd(song) {
        if (this.conn == null) {
            await this.join();
        }

        if (YouTube.validate(song, "PLAYLIST")) {   //playlist
            let res = await YouTube.getPlaylist(song);
            let duplicated = [];

            if (res.videoCount > 100) {
                res.videos = res.videos.slice(0, 100);
                res.videoCount = 100;
            }

            for (let i = 0; i < res.videoCount; i++) { //start of playlist loop
                const video = res.videos[i];
                let lastPos = this.queue[this.queue.length - 1]?.position;

                if (lastPos == undefined) {
                    this.addQueue(video, 1);
                    this.play();
                    this.station = [];
                } else {
                    let found = this.queue.filter(v => v.url === `https://www.youtube.com/watch?v=${video.id}`);

                    if (found.length == 0) {
                        this.addQueue(video, lastPos + 1);
                    } else {
                        duplicated.push(video);
                    }
                }

                if (i == res.videoCount - 1 && duplicated.length == 0) {
                    let embed = new MessageEmbed()
                        .setTitle(`Playlist added! | Songs added: ${res.videoCount}`)
                        .setColor(colors.info);
                    this.send(embed);
                }
            }//end of playlist loop

            if (duplicated.length > 0) {
                let embed = new MessageEmbed()
                    .setTitle("Multiple duplicated songs!")
                    .setDescription(`Duplicated songs: ${duplicated.length}`)
                    .setColor(colors.warning);
                this.send(embed);
            }
        }
        else {    //link or keywords
            let lastPos = this.queue[this.queue.length - 1]?.position;
            let video = await YouTube.searchOne(song);

            if (video == null) {
                let embed = new MessageEmbed()
                    .setTitle("Song not found! Try playing it as a keyword not URL!")
                    .setColor(colors.warning)
                this.send(embed);
                return;
            }

            if (lastPos == undefined) {
                this.addQueue(video, 1);
                this.play();
                this.embed("Added to queue", this.queue[0]);
                this.station = [];
            } else {
                let found = this.queue.filter(v => v.url === `https://www.youtube.com/watch?v=${video.id}`);

                if (found.length == 0) {
                    this.addQueue(video, lastPos + 1);
                    this.embed("Added to queue", this.queue[this.queue.length - 1]);
                } else {
                    let embed = new MessageEmbed()
                        .setTitle("This song is already in queue!")
                        .setDescription(`${video.title}`)
                        .setColor(colors.warning);
                    this.send(embed);
                }
            }
        }
    }

    async search(arg) {
        YouTube.search(arg).then(res => {
            console.log(res);
        });
    }

    async playRadio(arg) {
        if (this.conn == null) {
            await this.join();
        }

        this.station.push(arg);
        const streamOptions = { seek: 0, volume: this.volume, fec: true, bitrate: 320, highWaterMark: 24 };
        this.disp = this.conn.play(arg.url, streamOptions);
    }

    stopRadio() {
        this.orderQueue();
        this.station = [];
        this.disp.destroy();
        this.play();
    }

    skipCmd() {
        if (this.station.length > 0) {
            this.orderQueue();
            this.station = [];
            this.disp.destroy();
            this.disp = null;
            this.skipCmd();
        } else if (this.queue.length > 0) {
            if (this.looped) {
                this.queue.push(this.queue.shift());
            } else {
                this.queue.shift();
            }

            if (this.queue.length > 0) {
                this.orderQueue();
                this.play();
            } else {
                let embed = new MessageEmbed()
                    .setTitle("The queue is empty!")
                    .setColor(colors.warning);
                this.send(embed);
                this.clearCmd();
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("The queue is empty!")
                .setColor(colors.warning);
            this.send(embed);
            this.clearCmd();
        }
    }

    removeCmd(id) {
        if (this.queue.length > 0) {
            if (id <= this.queue.length) {
                if (id == this.queue[0].position) {
                    let removed = this.queue.shift();
                    this.orderQueue();
                    this.emptyQueueStuff();

                    let embed = new MessageEmbed()
                        .setTitle(`Song removed - ${removed.title}`)
                        .setColor(colors.info);
                    this.send(embed);

                    if (this.queue.length > 0) {
                        if (this.station.length == 0) {
                            this.disp.destroy();
                            this.play();
                        }
                    } else {
                        let embed = new MessageEmbed()
                            .setTitle("The queue is empty!")
                            .setColor(colors.warning);
                        this.send(embed);
                        this.clearCmd();
                    }
                } else {
                    let removed = this.queue[id - 1];
                    this.queue = this.queue.filter(x => x.position !== id);
                    this.orderQueue();
                    this.emptyQueueStuff();

                    let embed = new MessageEmbed()
                        .setTitle(`Song removed - ${removed.title}`)
                        .setColor(colors.info);
                    this.send(embed);
                }
            } else {
                let embed = new MessageEmbed()
                    .setTitle("Position not found!")
                    .setColor(colors.warning);
                this.send(embed);
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("The queue is empty!")
                .setColor(colors.warning);
            this.send(embed);
            this.clearCmd();
        }
    }

    clearCmd() {
        this.queue = [];
        this.conn = null;
        this.emptyQueueStuff();
        this.disp = this.disp !== null ? this.disp.destroy() : null;
        this.station = [];
    }

    pauseCmd() {
        if (this.station.length > 0) {
            let embed = new MessageEmbed()
                .setTitle("Radio can't be paused!")
                .setColor(colors.warning);
            this.send(embed);
        } else if (this.queue.length == 0) {
            let embed = new MessageEmbed()
                .setTitle("There is nothing to pause!")
                .setColor(colors.warning);
            this.send(embed);
        } else {
            this.paused = true;
            this.disp.pause();
            let embed = new MessageEmbed()
                .setTitle("Song paused!")
                .setColor(colors.info);
            this.send(embed);
        }
    }

    resumeCmd() {
        if (this.station.length > 0) {
            let embed = new MessageEmbed()
                .setTitle("Radio can't be resumed!")
                .setColor(colors.warning);
            this.send(embed);
        } else if (this.queue.length == 0) {
            let embed = new MessageEmbed()
                .setTitle("There is nothing to resume!")
                .setColor(colors.warning);
            this.send(embed);
        } else {
            this.disp.resume();
            this.paused = false;
            let embed = new MessageEmbed()
                .setTitle("Song resumed!")
                .setColor(colors.info);
            this.send(embed);
        }
    }

    loopCmd() {
        if (this.station.length > 0) {
            let embed = new MessageEmbed()
                .setTitle("Radio can't be looped!")
                .setColor(colors.warning);
            this.send(embed);
        } else if (this.queue.length == 0) {
            let embed = new MessageEmbed()
                .setTitle("There is nothing to loop!")
                .setColor(colors.warning);
            this.send(embed);
        } else {
            this.looped = !this.looped;
            let embed = new MessageEmbed()
                .setTitle(`Loop is ${this.looped ? "**on**" : "**off**"}`)
                .setColor(colors.info);
            this.send(embed);
        }

    }
}

module.exports = Dispatcher;