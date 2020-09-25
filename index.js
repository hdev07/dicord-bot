require('dotenv').config();

const Discord = require('discord.js');
const Canvas = require('canvas');
const fetch = require('node-fetch');
const querystring = require('querystring');
const client = new Discord.Client();
const prefix = '!';

const trim = (str, max) => str.length > max ? `${str.slice(0, max - 3)}...` : str;

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('Programar | !ayuda')
});

// Bienvenida
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = 70;

	do {
		ctx.font = `${fontSize -= 10}px sans-serif`;
	} while (ctx.measureText(text).width > canvas.width - 300);

	return ctx.font;
};

client.on('guildMemberAdd', async member => {
	const channel = member.guild.channels.cache.find(ch => ch.name === 'test-de-bots');
	if (!channel) return;

	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('./wallpaper.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	// Slightly smaller text placed above the member's display name
	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Bienvenido al server,', canvas.width / 2.5, canvas.height / 3.5);

	// Add an exclamation point here and below
	ctx.font = applyText(canvas, `${member.displayName}!`);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

	channel.send(`Hola, ${member} bienvenido/a! a **Colaboradores del senpai!** checa el canal de  #:scroll:-reglas para evitar problemas.`, attachment);
});

// Definiciones *** !urban ***
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'urban') {
		if (!args.length) {
			return message.channel.send('¡Debe proporcionar un término de búsqueda!.');
		}
		const query = querystring.stringify({ term: args.join(' ') });
		const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());

		if (!list.length) {
			return message.channel.send(`No se encontraron resultados para **${args.join(' ')}**.`);
		}

		const [answer] = list;
		const embed = new Discord.MessageEmbed()
			.setColor('#3D85C6')
			.setTitle(`Definición de ${answer.word}.`)
			.setURL(answer.permalink)
			.addFields(
				{ name: 'Definición', value: trim(answer.definition, 1024) },
				{ name: 'Ejemplo', value: trim(answer.example, 1024) },
				{ name: 'Votos', value: `:thumbsup: ${answer.thumbs_up} - | - :thumbsdown: ${answer.thumbs_down} ` },
				)
			.setFooter(`By: ${answer.author}.`);
		message.channel.send(embed);
	} else if (message.content === `${prefix}ayuda`) {

		const exampleEmbed = new Discord.MessageEmbed()
			.setColor('#3D85C6')
			.setTitle(`Comandos de ${client.user.username}`)
			.setAuthor(message.author.username, message.author.avatarURL() )
			.setDescription('Algunos comandos disponibles')
			.setThumbnail(client.user.avatarURL())
			.addFields(
				{ name: 'Obten tu avatar', value: '``!avatar``', inline: true },
				{ name: 'Busca una definición', value: '``!urban [palabra]``', inline: true },
			)
			.setTimestamp()
			.setFooter('Bot en desarrollo', client.user.avatarURL() );
		
			message.channel.send(exampleEmbed);
		} else if (message.content === `${prefix}avatar`) {

			const exampleEmbed = new Discord.MessageEmbed()
				.setColor('#3D85C6')
				.setTitle(`Apreciemos la hermosura de ${message.author.username}`)
				.setImage(message.author.avatarURL({ format: 'png', dynamic: true, size: 1024 }))
				.setFooter('Quisiera ser humano para andar con alguien tan hermoso/a como tu ❤️');
			
				message.channel.send(exampleEmbed);
		} else {
		return message.channel.send('Ese comando no existe prueva ``!ayuda``.');
	}
});

// *** Cacha los errores ***
// client.on("debug", (e) => console.info(e));
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.login(process.env.DISCORD_TOKEN);