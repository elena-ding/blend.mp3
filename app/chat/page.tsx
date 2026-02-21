'use client'

import React from 'react'
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'

import './chat.css'
import Link from 'next/link';

type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function App(): JSX.Element {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number>(Date.now());
  const [refreshKey, setRefreshKey] = useState(0);

  function newChat() {
    setMessages([]);
    setHasStarted(false);
    setCurrentChatId(Date.now());
  }

  function loadChat(chatId: number) {
    const existing = localStorage.getItem("chatHistory");
    const history = existing ? JSON.parse(existing) : [];
    const chat = history.find((c: any) => c.chatId === chatId);
    if (chat) {
      const loadedMessages: Message[] = chat.messages.flatMap((m: any) => [
        { role: 'user', content: m.user},
        { role: 'assistant', content: m.response}
      ]);
      setMessages(loadedMessages);
      setHasStarted(true);
      setCurrentChatId(chatId);
    }
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 0.5 }} 
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <img src="/assets/black-screen.png" className='black-overlay'/>
        
        {!hasStarted && <ChatDesc historyOpen={historyOpen} />}
        
        {hasStarted && (
          <ChatMessages messages={messages} isLoading={isLoading} historyOpen={historyOpen} />
        )}
        
        <ChatInput 
          hasStarted={hasStarted}
          setHasStarted={setHasStarted}
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          historyOpen={historyOpen}
          currentChatId={currentChatId}
          refreshHistory={() => setRefreshKey(k => k + 1)}
        />
        
        <Link href="/">
          <Logo />
        </Link>
        <HistoryPanel 
          isOpen={historyOpen} 
          setIsOpen={setHistoryOpen} 
          onNewChat={newChat} 
          refreshKey={refreshKey} 
          onLoadChat={loadChat}
        />
      </motion.div>
    </>
  )
}

function ChatDesc({ historyOpen }: { historyOpen: boolean }): JSX.Element {
  return (
    <motion.div
      className="chat-desc-container"
      initial={{ left: historyOpen ? 'calc(50% + 130px)' : '50%' }}
      animate={{ left: historyOpen ? 'calc(50% + 130px)' : '50%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <h2 className="chat-desc-text">
        enter a song and artist to get recommendations. <br />
        for more personalized results, tell us what you like about the song.
      </h2>
    </motion.div>
  )
}

// Component to display chat messages
function ChatMessages({ messages, isLoading, historyOpen }: { messages: Message[], isLoading: boolean, historyOpen: boolean }): JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <motion.div
      className="chat-messages-container"
      initial={{ paddingLeft: historyOpen ? '260px' : '0px' }}
      animate={{ paddingLeft: historyOpen ? '260px' : '0px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`message ${message.role}`}
          >
            <div className="message-content">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="message assistant"
          >
            <div className="message-content loading">
              <span>thinking</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </motion.div>
  )
}

function ChatInput({ 
  hasStarted, 
  setHasStarted, 
  messages, 
  setMessages,
  isLoading,
  setIsLoading,
  historyOpen,
  currentChatId,
  refreshHistory
}: { 
  hasStarted: boolean;
  setHasStarted: (value: boolean) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  historyOpen: boolean;
  currentChatId: number;
  refreshHistory: () => void;
}): JSX.Element {
  const [text, setText] = useState("");

  async function handleSubmit(prompt: string) {
    // Don't submit if already loading
    if (isLoading) return;
    
    // Mark chat as started
    setHasStarted(true);
    
    // Add user message immediately
    const userMessage: Message = { role: 'user', content: prompt };
    setMessages([...messages, userMessage]);
    
    // Clear input and set loading
    setText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await response.json();
      
      // Add assistant response
      if (data.result) {
        console.log("Response from API:", data);
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.result
        };
        setMessages([...messages, userMessage, assistantMessage]);
        const session = {
          chatId: Date.now(),
          user: userMessage.content,
          response: assistantMessage.content
        };
        const existing = localStorage.getItem("chatHistory");
        const history = existing ? JSON.parse(existing) : [];
        const chatIndex = history.findIndex((c: any) => c.chatId === currentChatId);

        if (chatIndex !== -1) {
          // Chat already exists, append to it
          history[chatIndex].messages.push({ user: userMessage.content, response: assistantMessage.content });
        } else {
          // First message in this chat
          history.push({
            chatId: currentChatId,
            title: userMessage.content, // First prompt becomes the title
            messages: [{ user: userMessage.content, response: assistantMessage.content }]
          });
          refreshHistory(); // Trigger history panel to refresh with new chat session
        }
        localStorage.setItem("chatHistory", JSON.stringify(history));
      } else if (data.error) {
        console.error("Error from API:", data.error);
        const errorMessage: Message = { 
          role: 'assistant', 
          content: "Sorry, there was an error processing your request."
        };
        setMessages([...messages, userMessage, errorMessage]);
      }
    } catch (error) {
      console.error("Connection failed:", error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: "Sorry, connection failed. Please try again."
      };
      setMessages([...messages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <motion.input 
        type="text" 
        className={hasStarted ? "chat-input-bottom" : "chat-input"}
        placeholder="start typing. (eg. beat it by michael jackson)" 
        value={text}
        onChange={(e) => setText(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === "Enter" && text && !isLoading) handleSubmit(text);
        }}
        disabled={isLoading}
        initial={{ left: historyOpen ? 'calc(50% + 130px)' : '50%' }}
        animate={{ left: historyOpen ? 'calc(50% + 130px)' : '50%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <motion.button 
        className={hasStarted ? 'upload-button-bottom' : 'upload-button'}
        whileHover={{ filter: "brightness(0.8)", zIndex: 1 }}
        onClick={() => { if (text && !isLoading) handleSubmit(text); }}
        disabled={isLoading}
        initial={{ left: historyOpen ? 'calc(77% + 130px)' : '77%' }}
        animate={{ left: historyOpen ? 'calc(77% + 130px)' : '77%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        ↑
      </motion.button>
    </>
  )
}

function HistoryPanel({ isOpen, setIsOpen, onNewChat, refreshKey, onLoadChat }: { isOpen: boolean, setIsOpen: (v: boolean) => void, onNewChat: () => void, refreshKey: number, onLoadChat: (chatId: number) => void }): JSX.Element {
  const [history, setHistory] = useState<{ chatId: number, title: string, messages: {user: string, response: string}[] }[]>([]);

  useEffect(() => {
    const existing = localStorage.getItem("chatHistory");
    const history = existing ? JSON.parse(existing) : [];
    setHistory(history);
  }, [isOpen, refreshKey]);

  return (
    <>
      <motion.button // Toggle button
        className="history-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ filter: "brightness(0.7)" }}
      >
        {isOpen ? '✕' : '☰'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="history-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.button
              className="new-chat-button"
              onClick={() => { onNewChat(); }}
            >
              + new chat
            </motion.button>
            <h3 className="history-title">history</h3>
            <div className="history-list">
              {history.map((session, index) => (
                <div key={index} className="history-item" onClick={() => onLoadChat(session.chatId)}>
                  {session.title}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Logo(): JSX.Element {
  return (
    <motion.button 
      className="logo-container"
      whileHover={{ cursor: "pointer" }}
    >
      <motion.img src="/assets/cd.png" style={{width: "35px", height: "35px"}} animate={{ rotate: 360 }} transition={{repeat: Infinity, duration: 7, ease: "linear"}} />
      <h2 className="logo-text">
        blend.mp3
      </h2>
    </motion.button>
  )
}