const WebSocket = require('ws');
const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');

//4 events related to websockets: need new because WebSocket is the constructor:
const wss =  new WebSocket.Server({ port: 6000 });

let usercount = 0;

//event handler for connection: web socket server object
wss.on('connection', (ws) => {
    ++usercount;
    console.log('Someone has joined: '+ usercount)

    //This clears all the conversation out of the database when the last person disconnects:
    ws.on('close', (ws) => {
        --usercount;
        console.log('Someone has left: '+ usercount)
        if (usercount < 1) {
            axios.get('http://localhost:4000/messanger/clearMessages')
            .then(() => { console.log('Cleared messages')})
            .catch(e => console.log(e));

            axios.get('http://localhost:4000/messanger/clearUsers')
            .then(() => { console.log('Cleared users')})
            .catch(e => console.log(e));
        }
    }) 
});

//we want to listen to messages being broadcast
client.on('message', (channel, message) => {
 console.log(`subscriber hears message ${message}`)

 //now we re-broadcast to all open tabs:
 wss.clients.forEach((client) => {
     client.send(message);
  });
});

client.subscribe('chatChannel');
