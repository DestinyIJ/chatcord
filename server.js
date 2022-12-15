const express = require('express');
const http = require('http')
const path = require('path');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user')
require('dotenv/config');


// ***** Environment variables *****
const PORT = process.env.SERVER_PORT || 8000;
const API_URL = process.env.API_URL
// ===== Environment variables =====


//  ***** Initializing App *****
const app = express();
const server = http.createServer(app);
const io = socketio(server)
// ===== Initializing App =====


//  ***** Set App Static folder *****
app.use(express.static(path.join(__dirname, 'public')))
// ===== Initializing App =====

//  *****  *****
// =====  =====

//  ***** Runs when server connects *****
io.on('connection', socket => {
    console.log("new web socket connected")

    // User joined a room
    socket.on('join-room', ({ username, room}) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)
        
         // Welcome connected user
        socket.emit('message', formatMessage('ChatCord', `Welcome to  ${user.room}, ${user.username}`)) // emits to the connected client
         // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage('ChatCord', `${user.username} joined the room`)) // emits to others except the connected client
        io.to(user.room).emit('room-users', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // listen for chat message
    socket.on('chatMessage', (chatMessage) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, chatMessage))
    })

    // runs when client disconnects
    socket.on('disconnect', () => {
        // broadcast to all
        const user = userLeave(socket.id)
        if(user) {
            io.to(user.room).emit('message', formatMessage('ChatCord', `${user.username} has left the room`))  // emits to all clients on namespace and room
            io.to(user.room).emit('room-users', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

        
        
    })
})
// ===== Runs when server connects =====

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
