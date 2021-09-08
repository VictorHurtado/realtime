var fs = require('fs');
var app = require('express')();
const server = require('http').createServer( app)
const options = {
    allowEIO3: true, 
    cors: {
        origin: ["http://localhost:8080", "http://localhost:8088"],
        methods: ["GET", "POST"]
    }
};
const io = require('socket.io')(server, options);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
const activeUsers = new Set();

io.on('connection', (socket) => {
    console.log("Made socket connection");
});

var total = 0;


io.sockets.on('connection', function (socket) {
    
    socket.on("new", function (data) {
        console.log('new user:', data);
        socket.userId = data;
        activeUsers.add(data);
        io.emit("new user", [...activeUsers]);
    });

    socket.on('disconnect', () => {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });
      
    socket.emit('bienvenida', {digo: 'Hola cliente WS!'});

    socket.on('setTotal', function (message) {
        console.log('recibido', message);
        total = total + message;
        socket.emit('getTotal', total);
    });

    socket.on('setRandom', function (cada_cuanto) {
        setInterval(function () {
            var rnd = Math.floor((Math.random() * 1000) + 1);
            socket.emit('getRandom', {numero: rnd})
        }, cada_cuanto);

    });

});

server.listen(8081, function () {
    console.log('Servidor iniciado en http://localhost:8081')
})
