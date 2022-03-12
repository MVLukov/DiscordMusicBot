let { MessageEmbed } = require("discord.js");
let colors = require("../settings/color.json");
require("dotenv").config();

class Player {
    constructor(message, voice) {
        this.message = message;
        this.voice = voice;
        this.conn = null;
        this.paused = false;
        this.looped = false;
        this.volume = 0.5;
        this.voteMes = null;
        this.search = [];
        //votes
        this.skipVote = false;
        this.removeVote = false;
        this.pauseVote = false;
        this.resumeVote = false;
        this.loopVote = false;
        this.clearVote = false;
        this.leaveVote = false;

    }

    async join() {
        this.conn = await this.message.member.voice.channel.join();
    }

    leave() {
        this.message.guild.me.voice.channel.leave();
    }

    embed(title, song) {
        let embed = new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(`[${song.title}](${song.url})`)
            .setThumbnail(`${song.thumbnail}`, `${song.thumbnail}`)
            //.addField(`Title`, `${song.title}`)
            // .addField(`URL`, `${song.url}`)
            // .addField(`Position`, `${song.position}`)
            // .addField(`Views`, `${song.views}`)
            // .addField(`Duration`, `${song.durationFormatted}`)
            .setColor(colors.info);
        this.message.channel.send(embed);
    }

    send(embed) {
        this.message.channel.send(embed).then(msg => {
            setTimeout(() => {
                msg.delete();
            }, process.env.delay * 1000);
        });
    }
}

module.exports = Player;

