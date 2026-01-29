'use client'

import React from 'react'
import { useState } from 'react';
import { motion } from 'framer-motion'

import './chat.css'

export default function App(): JSX.Element {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 0.5 }} 
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <img src="/assets/black-screen.png" className='black-overlay'/>
      <ChatDesc />
      <ChatInput />
      <Logo />
    </motion.div>
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

function ChatInput(): JSX.Element {
  const [text, setText] = useState("");
  const [pressedEnter, setPressedEnter] = useState(false);

  async function handleSubmit(prompt: string) {
    
  }

  return (
    <div>
      <input 
        type="text" 
        className="chat-input" 
        placeholder="start typing. (eg. beat it by michael jackson)" 
        value={text}
        onChange={(e) => setText(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === "Enter" && text) handleSubmit(text);
        }}
      />
      <button 
        className='upload-button' 
        onClick={() => {
            setPressedEnter(true) // If user clicked enter button
            if (text) { // If the user entered in text, submit the prompt
              handleSubmit(text);
            }
          }
        }
      >
        ↑
      </button>
    </div>
  )
}

function Logo(): JSX.Element {
  return (
    <div className="logo-container">
      <motion.img src="/assets/cd.png" style={{width: "35px", height: "35px"}} animate={{ rotate: 360 }} transition={{repeat: Infinity, duration: 7, ease: "linear"}} />
      <h2 className="logo-text">
        blend.mp3
      </h2>
    </div>
  )
}