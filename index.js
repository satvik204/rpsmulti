const { log } = require('console');
const express =  require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const rooms = {};

app.use(express.static(path.join(__dirname,'client'))); 
app.get('/',(req,res) =>{
    res.sendFile(__dirname + "/client/index.html");
})

io.on('connection',(socket)=>{
    console.log('a user connected');
    socket.on('disconnect',()=>{
        console.log('a user disconnected');
        
    } ) 
    socket.on('createGame',() => {
         const roomUniqueId = makeId(8);
         console.log(roomUniqueId);
         
        rooms[roomUniqueId] = {};
        socket.join(roomUniqueId);
        socket.emit("newGame",{roomUniqueId: roomUniqueId})
           
    })
    
    socket.on('joinGame',(data) =>{
        if (rooms[data.roomUniqueId] != null) {
            socket.join(data.roomUniqueId);
            socket.to(data.roomUniqueId).emit("playersConnected", {});
            socket.emit("playersConnected")
        }
    })
    socket.on("p1Choice",(data)=>{
        let rpsval = data.rpsValue;
        rooms[data.roomUniqueId].p1Choice = rpsval;
        socket.to(data.roomUniqueId).emit("p1Choice",{rpsval: data.rpsValue})

        if (rooms[data.roomUniqueId].p2Choice != null) {
            declareWinner(data.roomUniqueId);
        }
    })
    
    socket.on("p2Choice",(data)=>{
        let rpsval = data.rpsValue;
        rooms[data.roomUniqueId].p2Choice = rpsval;
        socket.to(data.roomUniqueId).emit("p2Choice",{rpsval: data.rpsValue})
        if (rooms[data.roomUniqueId].p1Choice != null) {
            declareWinner(data.roomUniqueId);
        }
    })
    socket.on("reround",(data)=>{
        rooms[data.roomUniqueId].p1Choice = null;
        rooms[data.roomUniqueId].p2Choice = null;
    })

    socket.on("reround", (data) => {
        // Reset game state for the room
        if (rooms[data.roomUniqueId]) {
            rooms[data.roomUniqueId].p1Choice = null;
            rooms[data.roomUniqueId].p2Choice = null;
            // Notify players to start a new round
            io.to(data.roomUniqueId).emit("newRound");
        }
    });
} )


function declareWinner(roomUniqueId){
    let p1Choice = rooms[roomUniqueId].p1Choice;
    let p2Choice = rooms[roomUniqueId].p2Choice;
    console.log(p1Choice,p2Choice);
    
    let winner  = null;
    if (p1Choice == p2Choice) {
        winner = "d";
    }else if (p1Choice == "Scissor") {
            if (p2Choice == "Paper") {
                winner = "p1";
            }
            else{
                winner = "p2";
            }
        }else if(p1Choice == "Paper"){
            if (p2Choice == "Scissor") {
                winner = "p2";
            }else{
                winner = "p1";
            }
        }
        else if (p1Choice == "Rock") {
            if (p2Choice == "Scissors") {
                winner = "p1"
                                 
            }
            }else{
                winner = "p2"
            }
        
    
    io.sockets.to(roomUniqueId).emit("result",{winner: winner})
}

server.listen(3000,() => {
    console.log("Listening at *:3000");
    
})

function makeId(length) {
    var result = '';
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var characterLength = characters.length;
    for (let i = 0; i < length; i++) {
        result +=characters.charAt(Math.floor(Math.random()*characterLength));
        
    }
    return result;
}