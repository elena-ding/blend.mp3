'use client'

import React from 'react'
import { motion } from 'framer-motion'

import './home.css'

export default function Home(): JSX.Element {
  return (
    <div className="home-bg">
      <video
        autoPlay
        loop
        muted
        src="/assets/gradient.mp4"
      ></video>
      <HomeTitle />
      <HomeSubtitle />
      <StartButton />
    </div>
  )
}

function HomeTitle(): JSX.Element {
  return (
    <div>
      <h1 className="home-title">
        blend.mp3
      </h1>
    </div>
  )
}

function HomeSubtitle(): JSX.Element {
  return (
    <div>
      <h2 className="home-subtitle">
        enter a song. unlock a whole new mood.
      </h2>
    </div>
  )
}

function StartButton(): JSX.Element {
  return (
    <div className="start-button-container">
      <motion.button className="start-button"
        whileHover={{
          scale: 1.07,
          boxShadow: '0px 0px 17px #ffffff'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        start now.
      </motion.button>
    </div>
  )
}
