const randomColor = () => {
   let color = '#';
   for (let i = 0; i < 6; i++){
      const random = Math.random();
      const bit = (random * 16) | 1;
      color += (bit).toString(16);
   };
   return color;
};

function genlink(messageHTML) {
	var re = /(?:^|\W)@(\w+)(?!\w)/g;
	var match = re.exec(messageHTML);
	if(match){
		messageHTML = messageHTML.replace(match[0], `<a href="https://www.twitch.tv/${match[1]}" target="_blank" style="color:${randomColor()}">${match[0]}</a>`)
	}
	
	var pattern = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	var res= messageHTML.match(pattern);
	if (res && !messageHTML.includes("https://www.twitch.tv/") && !messageHTML.includes("https://static-cdn.jtvnw.net/")) {
		messageHTML = messageHTML.replace(res[0], `<a href="${res[0]}" target="_blank" style="color:${randomColor()}">${res[0]}</a>`);
	}
	
	return messageHTML;
}

(function connect(){
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const twname = urlParams.get('twname')
	
	let socket = io.connect('http://localhost:3000',{ query: "twname="+twname })
	let curUsername = document.querySelector('.card-header')
	let message = document.querySelector('#message')
	let messageList = document.querySelector('#message-list')
	const messages = document.getElementById('message-list');
		
	if(twname === null){
		console.log("UPSI NO USERNAME SET");
		curUsername.textContent = "Wrong URl Format: 'https://URL/?twname={Twitch Username}'";
	}else{		
		socket.on('connect', function() {
			console.log("connected"); 
			socket.emit('join', {id: twname});
			curUsername.textContent = twname;
		});

		socket.on('receive_message', data => {
			let listItem = document.createElement('li');
			let date = new Date((data.time).slice(0, -3)*1000);
			let messagedate = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
			listItem.innerHTML = `<div class="date">${messagedate}</div> ${data.badge} <a href="https://www.twitch.tv/${data.user}" target="_blank" style="color:${randomColor()}"> ${data.user}</a>: ` + genlink(filterXSS(data.message));
			listItem.classList.add('list-group-item');
			messageList.appendChild(listItem);
			messages.scrollTop = messages.scrollHeight;
		})
		
		socket.on('disconnect', function () {
			console.log("disconnected"); 
			console.log("waiting for reconnect..."); 
		});
	}
})()