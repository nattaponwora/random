'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Home() {
  const [names, setNames] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentName, setCurrentName] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isReadyState, setIsReadyState] = useState(true) // New state to manage button visibility
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
    setIsReadyState(false)
  
    const startTime = Date.now()
    let interval = 10
    const totalDuration = 10000 // 10 วินาที
    let lastTime = startTime
  
    const run = () => {
      const now = Date.now()
      const elapsed = now - startTime
  
      if (elapsed >= totalDuration) {
        setIsRunning(false)
        fireConfetti()
        playApplause()
  
        // ลบชื่อที่ถูกเลือกออกจากลิสต์
        setNames((prev) => prev.filter((name) => name !== currentName))
        return
      }
  
      if (now - lastTime >= interval) {
        const index = Math.floor(Math.random() * names.length)
        setCurrentName(names[index])
        lastTime = now
        interval += 5 // ค่อยๆ เพิ่มช่วงเวลา เพื่อให้เลขช้าลงเรื่อยๆ
      }
  
      requestAnimationFrame(run)
    }
  
    requestAnimationFrame(run)
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
    <div className="flex min-h-screen">
        {/* Background image */}
        <div
          className="fixed inset-0 bg-cover bg-center opacity-30 z-0"
          style={{ backgroundImage: `url('/bg.jpg')` }}
        />
      
      {/* Sidebar */}
      <div className="relative z-20">
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
          className="absolute top-4 -right-4 z-10 bg-white text-green-700 border rounded-full shadow p-1 hover:bg-gray-100 transition"
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4 z-10">
        {isReadyState && (
            <h1 className={`text-[160px] font-bold mb-8 transition-all duration-500 text-green-700`}>
            พร้อมแล้ว!
          </h1>
        )}

        {!isReadyState && (
          <h1 className={`text-[160px] font-bold mb-8 transition-all duration-500 ${isRunning ? 'text-green-700' : 'text-green-400'}`}>
          {currentName}
          </h1>
        )}
       
        {!isRunning && (
          <button
            onClick={startRolling}
            disabled={isRunning || names.length === 0}
            className="bg-green-500 text-white px-10 py-3 rounded text-xl hover:bg-green-600 disabled:opacity-50"
          >
            เริ่ม
          </button>
        )}
      </div>
    </div>
  )
}
