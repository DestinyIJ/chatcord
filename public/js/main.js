const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.querySelector("#room-name")
const usersList = document.querySelector("#users")

// const { username, room } = Qs.parse(location.search, {
//     ignorQueryPrefix: true
// })

const getQueryStrings = () => {
    // Get the current URL
    const url = window.location.href;
  
    // Get the query string from the URL
    let queryString = url.split("?")[1];
  
    // Return the query string (or an empty string if there is none)
    let queryStringArray =  queryString.split("&") || "";
    const Qs = {}
    queryStringArray.map(queryString => {
        let params = queryString.split('=')
        let key = params[0]
        let value = params[1]

        Qs[key] = value
    })
    return Qs
}

const { username, room } = getQueryStrings()


const socket = io()

// Join chat-room
socket.emit('join-room', { username, room })

// get room info
socket.on('room-users', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message', ({ username, text, time}) => {
    outputMessage({ username, text, time})
})



// message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // get message 
    const msg = e.target.elements.msg.value

    // Emitting message to the server
    socket.emit('chatMessage', msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})


// output message to DOM
const outputMessage = ({ username, text, time}) => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${username}:- <span class="time">${time}</span></p>
                    <p class="text">
                        ${text}
                    </p>`
    document.querySelector('.chat-messages').appendChild(div)
    chatMessages.scrollTop = chatMessages.scrollHeight
}

// add Room name to DOM
const outputRoomName = (room) => {
    roomName.innerText = room
}

const outputUsers = (users) => {
    usersList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join("")}
    `
}




  

  