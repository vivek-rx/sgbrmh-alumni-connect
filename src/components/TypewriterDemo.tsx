"use client"
import React, { ReactNode, useEffect, useState } from "react"

type TypewriterProps = {
  texts: string[]
  delay?: number // seconds to pause after a full line
  baseText?: string
}

function Typewriter({ texts, delay = 2, baseText = "" }: TypewriterProps) {
  const [textIndex, setTextIndex] = useState(0)
  const [display, setDisplay] = useState(baseText)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    let typingTimer: number | undefined
    const current = texts[textIndex]

    if (charIndex <= current.length) {
      typingTimer = window.setTimeout(() => {
        setDisplay(baseText + current.slice(0, charIndex))
        setCharIndex((c) => c + 1)
      }, 60)
    } else {
      // finished typing — pause then move to next
      typingTimer = window.setTimeout(() => {
        setCharIndex(0)
        setTextIndex((i) => (i + 1) % texts.length)
      }, delay * 1000)
    }

    return () => window.clearTimeout(typingTimer)
  }, [charIndex, textIndex, texts, delay, baseText])

  return <span className="font-medium">{display}</span>
}

export function TypewriterDemo() {
  const texts = [
    "Haha, yaad hai wo hostel ke din... 💭",
      "Mess ka khana, par doston ke saath sab perfect lagta tha 😊",
  "Kab nikal gaye wo saal... samajh hi nahi aaya 🕰️",
    "Can’t believe we’re alumni now!",
  ]

  return (
    <IosOgShellCard>
      <div className="mr-auto px-4 py-2 mb-3 text-white bg-neutral-700 rounded-2xl">
        <Typewriter texts={texts} delay={2} baseText="" />
      </div>
    </IosOgShellCard>
  )
}

function IosOgShellCard({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-xs md:max-w-xl md:min-w-80 mx-auto flex flex-col rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-800 shadow-2xl p-1">
      <div className="p-4 flex flex-col md:px-5">
        <div className="mb-2 text-sm text-neutral-400">Messages</div>
        <div className="mb-3 text-xs text-neutral-500">Today 9:27 PM</div>

        {/* Old friend message */}
        <div className="ml-auto px-4 py-2 mb-3 text-white bg-amber-600 rounded-2xl">
          <span>Hey! Long time 😄</span>
        </div>

        {/* You reply */}
        <div className="mr-auto px-4 py-2 mb-3 text-white bg-neutral-700 rounded-2xl">
          <span>Brooo! Years have passed 😭</span>
        </div>

        {/* Typewriter continues the convo */}
        {children}

        <div className="mt-3 text-xs text-neutral-500">Delivered</div>
      </div>
    </div>
  )
}

export default TypewriterDemo
