'use client'

import React from 'react'
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'

import './chat.css'
import Link from 'next/link';

// NEW: Define message type for type safety
type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function App(): JSX.Element {
  // NEW: Track if chat has started and messages
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 0.5 }} 
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <img src="/assets/black-screen.png" className='black-overlay'/>
        
        {/* MODIFIED: Only show description when chat hasn't started */}
        {!hasStarted && <ChatDesc />}
        
        {/* NEW: Show messages when chat has started */}
        {hasStarted && (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
        
        {/* MODIFIED: Pass state setters to ChatInput */}
        <ChatInput 
          hasStarted={hasStarted}
          setHasStarted={setHasStarted}
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        
        <Link href="/">
          <Logo />
        </Link>
      </motion.div>
    </>
  )
}

function ChatDesc(): JSX.Element {
  return (
    <div className="chat-desc-container">
      <h2 className="chat-desc-text">
        enter a song and artist to get recommendations. <br />
        for more personalized results, tell us what you like about the song.
      </h2>
    </div>
  )
}

// NEW: Component to display chat messages
function ChatMessages({ messages, isLoading }: { messages: Message[], isLoading: boolean }): JSX.Element {
  // NEW: Create a ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // NEW: Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-messages-container">
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
        
        {/* Show loading indicator while waiting for response */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="message assistant"
          >
            <div className="message-content loading">
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  )
}

function ChatInput({ 
  hasStarted, 
  setHasStarted, 
  messages, 
  setMessages,
  isLoading,
  setIsLoading
}: { 
  hasStarted: boolean;
  setHasStarted: (value: boolean) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
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
    <div>
      <input 
        type="text" 
        className={hasStarted ? "chat-input-bottom" : "chat-input"}
        placeholder="start typing. (eg. beat it by michael jackson)" 
        value={text}
        onChange={(e) => setText(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === "Enter" && text && !isLoading) handleSubmit(text);
        }}
        disabled={isLoading} // Disable input while loading
      />
      <motion.button 
        className={hasStarted ? 'upload-button-bottom' : 'upload-button'}
        whileHover={{
          filter: "brightness(0.8)",
          zIndex: 1
        }}
        onClick={() => {
            if (text && !isLoading) {
              handleSubmit(text);
            }
          }
        }
        disabled={isLoading}
      >
        ↑
      </motion.button>
    </div>
  )
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