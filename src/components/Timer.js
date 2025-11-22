import React, { useEffect, useState, useRef } from 'react'
import styles from './Timer.module.css'

const Timer = () => {
  // Стандартні режими (секунди)
  const modes = {
    work: 1500, // 25 хв
    shortBreak: 300, // 5 хв
    longBreak: 900, // 15 хв
  }

  // Основні стани
  const [time, setTime] = useState(0) // час у секундах
  const [isRunning, setIsRunning] = useState(false) // чи працює таймер
  const [activeMode, setActiveMode] = useState('No activated mode') // поточний режим
  const [count, setCount] = useState(0) // загальна кількість циклів
  const [countWork, setCountWork] = useState(0)
  const [initialTime, setInitialTime] = useState(modes.work) // початковий час для прогрес-бара

  // Кастомні налаштування (хвилини → секунди)
  const [customWork, setCustomWork] = useState(25)
  const [customShortBreak, setCustomShortBreak] = useState(5)
  const [customLongBreak, setCustomLongBreak] = useState(15)

  const [workTime, setWorkTime] = useState(customWork * 60)
  const [shortTime, setShortTime] = useState(customShortBreak * 60)
  const [longTime, setLongTime] = useState(customLongBreak * 60)

  console.log('', countWork, workTime, shortTime, longTime)
  // Теми
  const [theme, setTheme] = useState('light')
  const [selectedTheme, setSelectedTheme] = useState(theme)

  // Збереження кастомних налаштувань
  const setCustomSettings = () => {
    const newWork = customWork * 60
    const newShort = customShortBreak * 60
    const newLong = customLongBreak * 60
    const newTheme = selectedTheme
    const newComplete = count

    setWorkTime(newWork)
    setShortTime(newShort)
    setLongTime(newLong)
    setTheme(newTheme)
    setCount(newComplete)

    // зберігаємо у localStorage
    localStorage.setItem('workTime', newWork)
    localStorage.setItem('shortTime', newShort)
    localStorage.setItem('longTime', newLong)
    localStorage.setItem('theme', newTheme)
    localStorage.setItem('complete', newComplete)

    // Оновлюємо час у залежності від режиму
    if (activeMode === 'work') {
      setTime(newWork)
      setInitialTime(newWork)
    } else if (activeMode === 'short break') {
      setTime(newShort)
      setInitialTime(newShort)
    } else if (activeMode === 'long break') {
      setTime(newLong)
      setInitialTime(newLong)
    }
  }

  // Режими
  const workAct = () => {
    setIsRunning(false)
    setTime(customWork * 60)
    setInitialTime(customWork * 60)
    setActiveMode('work')
  }
  const shortBreakAct = () => {
    setIsRunning(false)
    setTime(customShortBreak * 60)
    setInitialTime(customShortBreak * 60)
    setActiveMode('short break')
  }
  const longBreakAct = () => {
    setIsRunning(false)
    setTime(customLongBreak * 60)
    setInitialTime(customLongBreak * 60)
    setActiveMode('long break')
  }

  // Прогрес-бал
  const progress =
    initialTime > 0 ? ((initialTime - time) / initialTime) * 100 : 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  // Для сигналу
  const beepRef = useRef(null)

  // Витягуємо налаштування з localStorage при першому рендері
  useEffect(() => {
    const saveWorkTime = localStorage.getItem('workTime')
    const saveShortTime = localStorage.getItem('shortTime')
    const saveLongTime = localStorage.getItem('longTime')
    const saveTheme = localStorage.getItem('theme')
    const saveComplete = localStorage.getItem('complete')

    if (saveWorkTime) {
      setWorkTime(Number(saveWorkTime))
      setCustomWork(Number(saveWorkTime) / 60)
    }
    if (saveShortTime) {
      setShortTime(Number(saveShortTime))
      setCustomShortBreak(Number(saveShortTime) / 60)
    }
    if (saveLongTime) {
      setLongTime(Number(saveLongTime))
      setCustomLongBreak(Number(saveLongTime) / 60)
    }
    if (saveTheme) {
      setTheme(saveTheme)
    }
    if (saveComplete) {
      setCount(Number(saveComplete))
    }
  }, [])

  // Лічильник (зменшує час)
  useEffect(() => {
    if (!isRunning || time <= 0) return
    const id = setInterval(() => setTime((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [isRunning, time])

  useEffect(() => {
    if (time !== 0 || activeMode === 'No activated mode') return

    setIsRunning(false)
    if (beepRef.current) beepRef.current.play()

    if (activeMode === 'work') {
      // додаємо цикл
      setCount((prev) => {
        const newCount = prev + 1
        localStorage.setItem('complete', newCount)
        return newCount
      })
      setCountWork((p) => p + 1)

      // кожні 4 роботи → довга перерва
      if (count === 3) {
        setTime(customLongBreak * 60)
        setInitialTime(customLongBreak * 60)
        setActiveMode('long break')
        setCount(0)
      } else {
        setTime(customShortBreak * 60)
        setInitialTime(customShortBreak * 60)
        setActiveMode('short break')
      }
      setIsRunning(true)
    } else {
      // після перерви знову робота
      setTime(customWork * 60)
      setInitialTime(customWork * 60)
      setActiveMode('work')
      setIsRunning(true)
    }
  }, [time])

  // Формат часу (MM:SS)
  const formatTime = (time) => {
    const m = Math.floor(time / 60)
    const s = time % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Колір для індикатора
  const indicatorColor =
    activeMode === 'work'
      ? '#10b981'
      : activeMode === 'short break'
      ? '#f59e0b'
      : activeMode === 'long break'
      ? '#3b82f6'
      : '#9ca3af'

  return (
    <div
      className={`${styles.wrapper} ${
        theme === 'light'
          ? activeMode === 'work'
            ? styles.workLight
            : activeMode === 'short break'
            ? styles.shortLight
            : activeMode === 'long break'
            ? styles.longLight
            : ''
          : activeMode === 'work'
          ? styles.workDark
          : activeMode === 'short break'
          ? styles.shortDark
          : activeMode === 'long break'
          ? styles.longDark
          : ''
      }`}
    >
      <h1 className={styles.title}>🍅 Pomodoro Timer</h1>

      {/* SVG таймер */}
      <svg className={styles.timerSvg} viewBox="0 0 160 160">
        <circle className={styles.timerTrack} r={radius} cx="80" cy="80" />
        <circle
          className={styles.timerProgress}
          stroke={indicatorColor}
          r={radius}
          cx="80"
          cy="80"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text className={styles.timerText} x="50%" y="50%">
          {formatTime(time)}
        </text>
      </svg>

      {/* Інфо */}
      <p className={styles.mode}>Current: {activeMode}</p>
      <p className={styles.mode}>Progress: {Math.round(progress)}%</p>
      <p className={styles.counter}>Completed Pomodoros: {count}</p>

      {/* Панель */}
      <div className={styles.container}>
        {/* Налаштування */}
        <div
          className={`${styles.settings} ${
            theme === 'dark' ? styles.settingsDark : ''
          }`}
        >
          <p>⚙️ Set custom settings (minutes)</p>
          <label>
            Work:
            <input
              type="text"
              value={customWork}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setCustomWork(val === '' ? '' : Number(val))
              }}
              className={styles.input}
            />
          </label>
          <label>
            Short Break:
            <input
              type="text"
              value={customShortBreak}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setCustomShortBreak(val === '' ? '' : Number(val))
              }}
              className={styles.input}
            />
          </label>
          <label>
            Long Break:
            <input
              type="text"
              value={customLongBreak}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setCustomLongBreak(val === '' ? '' : Number(val))
              }}
              className={styles.input}
            />
          </label>
          <label>
            Change theme:
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className={styles.input}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button onClick={setCustomSettings}>Save</button>
        </div>

        {/* Управління */}
        <div className={styles.controls}>
          <button onClick={() => setIsRunning(true)}>▶ Start</button>
          <button onClick={() => setIsRunning(false)}>⏸ Pause</button>
          <button
            onClick={() => {
              setIsRunning(false)
              setTime(0)
              setInitialTime(0)
              setActiveMode('No activated mode')
              setCountWork(0)
              setCount(0)
              localStorage.setItem('complete', 0)
            }}
          >
            🔄 Reset
          </button>
        </div>

        {/* Вибір режимів */}
        <div className={styles.modes}>
          <button onClick={workAct}>💼 Work</button>
          <button onClick={shortBreakAct}>☕ Short Break</button>
          <button onClick={longBreakAct}>😴 Long Break</button>
        </div>

        {/* Сигнал */}
        <audio
          ref={beepRef}
          id="beep"
          src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
          preload="auto"
        />
      </div>
    </div>
  )
}

export default Timer
