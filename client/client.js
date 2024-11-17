console.log("working");
const socket = io();
let roomUniqueId = null;
let player1 = false;

function createGame() {
    player1 = true;
    socket.emit("createGame");
}

function joinGame(){
    roomUniqueId = document.getElementById("roomUniqueId").value;
    socket.emit('joinGame',{roomUniqueId: roomUniqueId});
}
socket.on("newGame",(data) => {
    roomUniqueId = data.roomUniqueId;
    document.getElementById("initial").style.display = "none";
    document.getElementById("gamePlay").style.display = "block";
    let copyButton = document.createElement('button');
    copyButton.innerText = "Copy Code";
    copyButton.style.display = "block";
    copyButton.addEventListener('click',() => {
        navigator.clipboard.writeText(roomUniqueId).then(function () {
            console.log("Async: Copy to clipboard was successful.");
            
        },function (err) {
            console.log("Async: Could not copy text: ",err);
            
        })
    })

    document.getElementById("waitingArea").innerHTML= `Waiting for opponent!, Please share code ${roomUniqueId} to join.`;
    document.getElementById("waitingArea").appendChild(copyButton);
    
})


socket.on("playersConnected",() => {
  document.getElementById('waitingArea').style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("initial").style.display = "none";
})

socket.on("p1Choice",(data)=>{
    if (!player1) {
        createOpponentChoiceButton(data);
        
    }
})


socket.on("p2Choice",(data)=>{
    if (player1) {
        createOpponentChoiceButton(data);
    }
})

function sendChoice(choice) {
    const choiceEvent= player1 ? "p1Choice":"p2Choice";
    socket.emit(choiceEvent,{
        rpsValue: choice,
        roomUniqueId: roomUniqueId
    })
    let pcButton = document.createElement('button');
    pcButton.style.display = "block";
    pcButton.innerHTML= choice;
    document.getElementById("player1choice").innerHTML = "";
    document.getElementById("player1choice").append(pcButton);
}

function createOpponentChoiceButton(data) {
    document.getElementById("opponentState").innerHTML = "Opponent made a choice";
    let opponentBtn = document.createElement('button');
    opponentBtn.id = "OpponentBtn";
    opponentBtn.style.display = "none";
    opponentBtn.innerHTML = data.rpsval;
    document.getElementById('gameArea').appendChild(opponentBtn)
}

socket.on("result",(data)=>{
    let winnertext = "";
    console.log("worked");
    
    if (data.winner == "d") {
        winnertext = "Its a draw!";
    }
    else if (data.winner == "p2") {
        if (!player1) {
            winnertext = "You Won!";
        }else{
            winnertext = "You Lose!";
        }
    }else{
        if (player1) {
            winnertext = "You Won!";
        }else{
            winnertext = "You Lose!";
        }  
        
    }

    document.getElementById('opponentState').style.display = "none";
    document.getElementById('OpponentBtn').style.display = "block";
    let winnertxt =  document.createElement('p');
    winnertxt.innerHTML = winnertext;;
    document.getElementById("winnerArea").appendChild(winnertxt);
    document.getElementById('winnerArea').style.display= "block";

})