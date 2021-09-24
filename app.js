const { json } = require('express');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT,()=> {
    console.log('Server is Started on', PORT);
});

const io = require('socket.io')(server);


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


const connectedUser = new Set();
var total = 0;
var quantityUsers=0;

io.on('connection', (socket)=>{

    console.log("Connected Successfully", socket.id);

    connectedUser.add(socket.id);

    io.emit('connected-user', connectedUser.size);

    socket.on('setTotal',  (message)=> {
        console.log('recibido', message);
        total = total + message;
        socket.broadcast.emit('getTotal', total);
    });
    socket.on('newOperator',  (order)=> {
        console.log('recibido', order);
        if(order['status']==1){
            total = total + 1;
            console.log('quantity users connect', total);
        }else{
            total = total - 1;
            console.log('quantity users connect', total);
        }
        socket.broadcast.emit('updateOrder', JSON.stringify(order));
    });

    socket.on('disconnect', () => {
        console.log("Disconnected", socket.id);
        connectedUser.delete(socket.id);
        io.emit('connected-user', connectedUser.size);
    });

    socket.on('message', (data) => {
        console.log(data);
        socket.broadcast.emit('message-receive',data);
    });
});
