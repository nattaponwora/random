'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Home() {
  const [names, setNames] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentName, setCurrentName] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showStartButton, setShowStartButton] = useState(true) // New state to manage button visibility
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [speed, setSpeed] = useState(100) // Speed for slowing down the random number change

  useEffect(() => {
    const stored = localStorage.getItem('names')
    if (stored) setNames(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('names', JSON.stringify(names))
  }, [names])

  const startRolling = () => {
    if (names.length === 0) return
    setIsRunning(true)
    setShowStartButton(false) // Hide the button when start rolling
    const startTime = Date.now()

    intervalRef.current = setInterval(() => {
      const index = Math.floor(Math.random() * names.length)
      setCurrentName(names[index])

      if (Date.now() - startTime >= 10000) {
        clearInterval(intervalRef.current!)
        setIsRunning(false)
        setShowStartButton(true) // Show the button after rolling is done
        fireConfetti()
        playApplause()
        setNames((prev) => prev.filter((_, i) => i !== 0)) // Remove the first number in the list
      }
    }, speed)

    // Gradually slow down the speed
    const slowDownInterval = setInterval(() => {
      if (speed >= 1000) {
        clearInterval(slowDownInterval) // Stop slowing down after a certain point
      }
      setSpeed((prevSpeed) => prevSpeed + 100)
    }, 500)
  }

  const handleAdd = () => {
    const number = parseInt(inputValue)
    if (!isNaN(number) && number > 0) {
      const generated = Array.from({ length: number }, (_, i) => (i + 1).toString())
      setNames((prev) => [...prev, ...generated])
    }
    setInputValue('')
  }

  const playApplause = () => {
    const audio = new Audio('/applause.wav')
    audio.play()
  }

  const fireConfetti = () => {
    const duration = 20000 
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 45, spread: 360, ticks: 90, zIndex: 1000 }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      confetti({
        ...defaults,
        particleCount: 100,
        origin: { x: Math.random(), y: Math.random() },
      })
    }, 200)
  }

  return (
    <div className="flex min-h-screen bg-green-100">
      {/* Sidebar */}
      <div className="relative">
        <div
          className={`transition-all duration-300 h-screen bg-white shadow-md overflow-hidden ${
            isSidebarOpen ? 'w-64 p-4' : 'w-0'
          }`}
        >
          <label className="block text-black text-sm font-medium mb-1">ใส่จำนวนเลขที่จะสุ่ม</label>
          <input
            type="number"
            className="w-full p-2 border rounded text-black"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ใส่จำนวน เช่น 50"
          />
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleAdd}
          >
            สร้างรายการ
          </button>

          <button
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => setNames([])}
          >
            ลบรายชื่อทั้งหมด
          </button>

          <h3 className="mt-4 font-semibold text-black">รายชื่อ ({names.length})</h3>
          <ul className="list-disc list-inside text-sm max-h-40 overflow-y-auto text-black">
            {names.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 -right-4 z-10 bg-white border rounded-full shadow p-1 hover:bg-gray-100 transition"
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <h1 className={`text-[160px] font-bold mb-8 transition-all duration-500 ${isRunning ? 'text-red-600' : 'text-pink-500'}`}>
          {currentName || 'พร้อมแล้ว!'}
        </h1>
        {showStartButton && (
          <button
            onClick={startRolling}
            disabled={isRunning || names.length === 0}
            className="bg-green-500 text-white px-6 py-3 rounded text-xl hover:bg-green-600 disabled:opacity-50"
          >
            เริ่มสุ่ม
          </button>
        )}
      </div>
    </div>
  )
}
