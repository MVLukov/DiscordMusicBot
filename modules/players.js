let { MessageEmbed } = require("discord.js");
let colors = require("../settings/color.json");

module.exports = {
    players: [],
    find(message) {
        return this.players.find(x => x.id == message.guild.id)?.player;
    },
    push(data) {
        this.players.push(data);
    },
    filter(oldMember) {
        this.players = this.players.filter(x => x.id != oldMember.guild.id);
    },
    autoLeave() {
        this.players.forEach(i => {
            let player = i.player;
            if (player.conn == null) {
                player.leave();
                let embed = new MessageEmbed()
                    .setTitle("Queue was empty so I left!")
                    .setColor(colors.bye);
                player.message.channel.send(embed).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 5 * 1000);
                });
                this.players.filter(x => x.player.conn !== null);
            }
        });
    }
};