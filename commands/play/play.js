let { MessageEmbed, colors, players, sendAndDelete, Dispatcher, search } = require("../required");

module.exports = {
    name: "play",
    aliases: ["play", "p"],
    description: "",
    execute(message, arg) {
        if (message.member.voice.channel) {
            let player = players.find(message);
            if (player == undefined) {
                players.push({
                    id: message.guild.id,
                    player: new Dispatcher(message, message.member.voice.channel.id),
                });
            }

            player = players.find(message);

            if (message.member.voice.channel.id !== player?.voice && player?.conn !== null) {
                let channel = message.guild.channels.cache.find(c => c.id === player.voice && c.type === "voice");
                let embed = new MessageEmbed()
                    .setTitle(`Sorry but I'm playing music in ${channel.name.toUpperCase()}!`)
                    .setColor(colors.warning);
                sendAndDelete(message, embed);
            } else if (arg.length == 0) {
                player.join();
                let embed = new MessageEmbed()
                    .setTitle("Please choose a song!")
                    .setColor(colors.warning);
                sendAndDelete(message, embed);
            } else {
                player.message = message;
                player.voice = message.member.voice.channel.id;

                let parsed = arg.join(" ").replace(/[0-9 ]/g, "");
                
                if(parsed.length > 0){
                    player.playCmd(arg.join(" "));
                } else {
                    if (search.size > 0) {
                        for (const [key,value] of search) {
                            if(key.guildId == message.guild.id ){
                                if(key.i == arg.join(" ")){
                                    player.playCmd(value);
                                }
                                search.delete(key);
                            }
                        }
                    }
                }
            }
        } else {
            let embed = new MessageEmbed()
                .setTitle("You are not in voice channel!")
                .setColor(colors.warning);
            sendAndDelete(message, embed);
        }
    },
};
