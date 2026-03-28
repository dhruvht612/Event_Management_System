import { io } from 'socket.io-client'

const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

export function getSocket(token) {
  return io(url, {
    autoConnect: true,
    auth: { token },
    transports: ['websocket', 'polling'],
  })
}
