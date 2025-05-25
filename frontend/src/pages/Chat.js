import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Chat.css';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/auth/profile');
        console.log('Current user data received:', response.data);
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError('Failed to load user data');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory();
    }
  }, [selectedUser]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/messages/${selectedUser._id}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post('/api/messages', {
        receiverId: selectedUser._id,
        content: newMessage.trim()
      });
      console.log('Message sent response:', response.data);
      setMessages(prevMessages => [...prevMessages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="chat-container">
      <div className="users-list">
        <h2>Chats</h2>
        {users.length === 0 ? (
          <div className="no-users">
            <p>No users found</p>
          </div>
        ) : (
          users.map(user => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-avatar">
                {user.firstName?.[0] || user.email[0]}
              </div>
              <div className="user-info">
                <h3>{user.firstName || user.email}</h3>
                <p>{user.email}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>{selectedUser.firstName || selectedUser.email}</h2>
            </div>
            <div className="messages-container">
              {messages.map((message) => {
                console.log('DEBUG MESSAGE DISPLAY:', {
                  messageSenderId: message.senderId._id,
                  currentUserId: currentUser?._id,
                  isSent: message.senderId._id === currentUser?._id,
                  messageContent: message.content,
                  currentUser: currentUser
                });
                return (
                  <div
                    key={message._id}
                    className={`message ${message.senderId._id === currentUser?._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 