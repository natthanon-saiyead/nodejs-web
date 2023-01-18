const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('set nickname', function(nickname) {
    console.log('setting nicknam', nickname);
    users[socket.id] = nickname;
    //socket.broadcast.emit('user joined', nickname);
    io.emit('user joined',nickname);
    io.emit('update users',Object.values(users));
  });

  socket.on('send message', function(msg){
    console.log('receive message', msg);
    //socket.broadcast.emit('receive message', users[socket.id], msg);
    io.emit('receive message', users[socket.id], msg);
  });

  socket.on('typing', function(){
    socket.broadcast.emit('typing', users[socket.id]);
  });

  socket.on('stop typing', function(){
    socket.broadcast.emit('stop typing', users[socket.id]);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    socket.broadcast.emit('user left', users[socket.id]);
    delete users[socket.id];
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
