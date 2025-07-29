import React, { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import { FaComments } from 'react-icons/fa';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hi! I'm your shopping assistant 🤖. How can I help you today?",
      sender: "bot"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

 const handleSend = async (userMessage) => {
  const newMessage = { message: userMessage, sender: "user" };
  const updatedMessages = [...messages, newMessage];
  setMessages(updatedMessages);
  setIsTyping(true);

  const lower = userMessage.toLowerCase();

  if (lower.includes("hello")) {
    const swapReply = {
  message:
    "Hello from SWAP! 👋\n\nPlease choose one of the following options:\n\n" +
    "1️⃣ Order\n" +
    "2️⃣ Exchange\n" +
    "3️⃣ Feedback\n" +
    "4️⃣ Contact Us",
  sender: "bot",
  options: ["Order", "Exchange", "Feedback", "Contact Us"]
};

    setMessages(prev => [...prev, swapReply]);
    setIsTyping(false);
    return;
  }

  // Handle button replies (Order, Exchange, etc.)
  switch (lower) {
    case "order":
      setMessages(prev => [...prev, {
        message: "To place an order:\n1. Visit the collection page.\n2. Choose an item.\n3. Select the size.\n4. Go to the cart.\n5. Proceed to checkout.",
        sender: "bot"
      }]);
      break;
    case "exchange":
      setMessages(prev => [...prev, {
        message: "To request an exchange:\n1. Go to your order history.\n2. Select the item.\n3. Click 'Request Exchange' and submit your reason.",
        sender: "bot"
      }]);
      break;
    case "feedback":
      setMessages(prev => [...prev, {
        message: "To give feedback:\n1. Visit the feedback page.\n2. Fill in the form and submit.\nYour feedback helps us improve!",
        sender: "bot"
      }]);
      break;
    case "contact us":
      setMessages(prev => [...prev, {
        message: "To contact us:\n1. Go to the Contact Us page.\n2. Fill out the contact form.\nWe'll get back to you shortly!",
        sender: "bot"
      }]);
      break;
    default:
      setMessages(prev => [...prev, {
        message: "Sorry, I didn't understand that. Please try typing 'hello' again to start.",
        sender: "bot"
      }]);
  }

  setIsTyping(false);
};


const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    setMessages(prev => [...prev, {
      message: `📎 File uploaded: ${file.name}`,
      sender: "user"
    }]);
    // Optionally: send the file to your server here
  }
};


  return (
    <>
      {/* Floating circle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
           position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4e8cff',
    color: 'white',
    border: 'none',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    display: 'flex',                // enables flex layout
    alignItems: 'center',           // vertical centering
    justifyContent: 'center',       // horizontal centering
    fontSize: '24px'
          }}
        >
          <FaComments />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          height: '500px',
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '10px',
            backgroundColor: '#4e8cff',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            AI Assistant
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✖
            </button>
          </div>

          {/* Chat UI */}
           <MainContainer>
        <ChatContainer>
          <MessageList typingIndicator={isTyping ? <TypingIndicator content="AI Assistant is typing" /> : null}>
            {messages.map((msg, i) => (
              <Message key={i} model={{
                message: msg.message,
                sentTime: "just now",
                sender: msg.sender === "bot" ? "AI Assistant" : "You",
                direction: msg.sender === "bot" ? "incoming" : "outgoing"
              }} />
            ))}
          </MessageList>
          <MessageInput placeholder="Ask me anything..." onSend={handleSend}  />
        </ChatContainer>
      </MainContainer>
        </div>
      )}
    </>
  );
};

export default Chatbot;
