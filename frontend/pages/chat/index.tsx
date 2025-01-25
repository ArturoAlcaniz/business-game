import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { useNotifications } from '../../context/NotificationContext';

interface Message {
  id: number;
  content: string;
  user: {
    username: string;
  };
  createdAt: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const router = useRouter();
  const { notifications, addNotification } = useNotifications();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login'); // Redirigir al login si no está autenticado
      return;
    }

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: token, // Envía el token JWT aquí
      },
    });

    // Escuchar nuevos mensajes
    newSocket.on('newMessage', (message: Message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    // Escuchar nuevas notificaciones
    newSocket.on('newNotification', (notification: any) => {
      addNotification(notification);
    });

    // Obtener los últimos mensajes al cargar la página
    newSocket.emit('getMessages');
    newSocket.on('lastMessages', (messages: any) => {
      setMessages(messages);
    });

    setSocket(newSocket);

    // Limpiar la conexión al desmontar el componente
    return () => {
      newSocket.disconnect();
    };
  }, [router, addNotification]);

  const handleSendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit('sendMessage', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Chat</h1>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '10px',
          height: '300px',
          overflowY: 'scroll',
        }}
      >
        {messages.map((message: Message) => (
          <div key={message.id} style={{ marginBottom: '10px' }}>
            <strong>{message.user.username}</strong>: {message.content}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            width: '80%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
        >
          Enviar
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Notificaciones</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              {notification.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}