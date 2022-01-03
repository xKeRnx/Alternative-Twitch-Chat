const express = require('express')
const socketio = require('socket.io')
const app = express()
const tmi = require('tmi.js')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("server is running")
})

const io = socketio(server, {'transports': ['websocket', 'polling'], allowEIO3: true})

var rooms = [];

io.sockets.on('connection', socket => {
	console.log('User '+socket.id + ' connected')
	//Get Twitch Username from CLient
    socket.username = socket.handshake.query['twname'];

	if(socket.username != "None" && socket.username != ""){
		
		//Client joins a Room
		socket.on('join', function (data) {
			//socket.leave(socket.room);
			socket.leaveAll();
			socket.join(data.id);
			console.log("socket_join:"+data.id);
			
		});
	
		//Generate new Room and send Messages to Clients
		if (rooms.includes(socket.username) == false) {
			rooms.push(socket.username);
			console.log("Add room for: " + socket.username);
			const client = new tmi.Client({
			  connection: {
				secure: true,
				reconnect: false
			  },
			  channels: [socket.username]
			})

			client.connect()

			//Sent Messages to Client
			client.on('message', (channel, tags, message, self) => {
				//Send Message to Client if Socket Username == Twitch Username
				if("#"+socket.username == `${channel}`){
					var badges = "";
					if(tags['badges']!=null){
						for(var attributename in tags['badges']){
							let bt_nr = tags['badges'][attributename];
							switch(attributename) {
								case 'subscriber':
									if(bt_nr == 0){
										badges += `<img alt="${bt_nr}-Month Subscriber" src="https://static-cdn.jtvnw.net/badges/v1/4c7888a0-dba5-43fc-ae28-69ebe446e847/2" width="20" height="20">`;
									}else if(bt_nr == 1){
										badges += `<img alt="${bt_nr}-Month Subscriber" src="https://static-cdn.jtvnw.net/badges/v1/4c7888a0-dba5-43fc-ae28-69ebe446e847/2" width="20" height="20">`;
									}else if(bt_nr == 2){
										badges += `<img alt="${bt_nr}-Month Subscriber" src="https://static-cdn.jtvnw.net/badges/v1/4c7888a0-dba5-43fc-ae28-69ebe446e847/2" width="20" height="20">`;
									}else{
										badges += `<img alt="${bt_nr}-Month Subscriber" src="https://static-cdn.jtvnw.net/badges/v1/fa31a359-13bc-4df6-82e9-e0c944ce5efa/2" width="20" height="20">`;
									}
									break;
								case 'moderator':
									badges += `<img alt="Moderator" src="https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/2" width="20" height="20">`;
									break;
								case 'partner':
									badges += `<img alt="Partner" src="https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/2" width="20" height="20">`;
									break;
								case 'premium':
									badges += `<img alt="Prime Gaming" src="https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/2" width="20" height="20">`;
									break;
								case 'glhf-pledge':
									badges += `<img alt="GLHF Pledge" src="https://static-cdn.jtvnw.net/badges/v1/3158e758-3cb4-43c5-94b3-7639810451c5/2" width="20" height="20">`;
									break;
								case 'sub-gifter':
									if(bt_nr < 5){
										badges += `<img alt="Sub Gifter" src="https://static-cdn.jtvnw.net/badges/v1/f1d8486f-eb2e-4553-b44f-4d614617afc1/2" width="20" height="20">`;
									}else if(bt_nr >= 50){
										badges += `<img alt="${bt_nr}-Sub Gifts" src="https://static-cdn.jtvnw.net/badges/v1/47308ed4-c979-4f3f-ad20-35a8ab76d85d/2" width="20" height="20">`;
									}else{
										badges += `<img alt="${bt_nr}-Sub Gifts" src="https://static-cdn.jtvnw.net/badges/v1/17e09e26-2528-4a04-9c7f-8518348324d1/2" width="20" height="20">`;
									}
									break;
								case 'turbo':
									badges += `<img alt="Turbo" src="https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/2" width="20" height="20">`;
									break;
								case 'sub-gift-leader':
									if(bt_nr == 3){
										badges += `<img alt="Gift Leader 3" src="https://static-cdn.jtvnw.net/badges/v1/4c6e4497-eed9-4dd3-ac64-e0599d0a63e5/2" width="20" height="20">`;
									}else{
										badges += `<img alt="Sub-Gift Leader" src="https://static-cdn.jtvnw.net/badges/v1/47308ed4-c979-4f3f-ad20-35a8ab76d85d/2" width="20" height="20">`;
									}
									break;
								case 'glitchcon2020':
									badges += `<img alt="Glitch Con 2020" src="https://static-cdn.jtvnw.net/badges/v1/1d4b03b9-51ea-42c9-8f29-698e3c85be3d/2" width="20" height="20">`;
									break;
								case 'vip':
									badges += `<img alt="VIP" src="https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/2" width="20" height="20">`;
									break;
								case 'cheer':
									badges += `<img alt="Cheer ${bt_nr}" src="https://static-cdn.jtvnw.net/badges/v1/09d93036-e7ce-431c-9a9e-7044297133f2/2" width="20" height="20">`;
									break;
								default:
									//do this
									break;
							}
						}
					}
					
					io.sockets.in(socket.username).emit('receive_message', {user: tags['display-name'] ,message: getMessageHTML(message, tags), username: socket.username, time: tags['tmi-sent-ts'], badge: badges});
					//console.log("message_sent to:" + socket.username);
				}
			});
		}
		
	}
	
	//Remove Client from Socket on Disconnect
    socket.on('disconnect', function() {
		socket.leaveAll();
		console.log('User '+socket.id + ' left')
    });

});

//Get Emotes from Tags
function getMessageHTML(message, { emotes }) {
	if (!emotes) return message;

	// store all emote keywords
	// ! you have to first scan through 
	// the message string and replace later
	const stringReplacements = [];

	// iterate of emotes to access ids and positions
	Object.entries(emotes).forEach(([id, positions]) => {
		// use only the first position to find out the emote key word
		const position = positions[0];
		const [start, end] = position.split("-");
		const stringToReplace = message.substring(
		  parseInt(start, 10),
		  parseInt(end, 10) + 1
		);

		stringReplacements.push({
		  stringToReplace: stringToReplace,
		  replacement: `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/2.0" width="30" height="36">`,
		});
	});

	// generate HTML and replace all emote keywords with image elements
	const messageHTML = stringReplacements.reduce(
		(acc, { stringToReplace, replacement }) => {
		  // obs browser doesn't seam to know about replaceAll
		  return acc.split(stringToReplace).join(replacement);
		},
		message
	);

	return messageHTML;
}

