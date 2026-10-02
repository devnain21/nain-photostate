"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOjRuYWhQGvJeQWT4w6knLknfSR7431Ord6IzBCrcchJQwDusOZmKevQ_FFncp5jQZ9cuQ0MAjW1V4/pub?gid=0&single=true&output=csv"
const CACHE_KEY = 'panchang_ticker_cache_v1'

const getInitialTickerData = () => {
  if (typeof window === 'undefined') {
    return { news: [], special: 'आज सभी ऑनलाइन काम चालू हैं!' }
  }
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      return {
        news: Array.isArray(parsed.news) ? parsed.news : [],
        special: parsed.special || 'आज सभी ऑनलाइन काम चालू हैं!',
      }
    }
  } catch {
    // Ignore error
  }
  return { news: [], special: 'आज सभी ऑनलाइन काम चालू हैं!' }
}

function TickerClock() {
  const [currentTime, setCurrentTime] = useState(null)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000)
    const initialTimer = window.setTimeout(() => setCurrentTime(new Date()), 0)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(initialTimer)
    }
  }, [])

  const timeString = currentTime
    ? currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--'
  const dateString = currentTime
    ? currentTime.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'लोड हो रहा है'

  return (
    <div className="ticker-time-box">
      {timeString} <span className="hide-mobile">| {dateString}</span>
    </div>
  )
}

const PanchangTicker = () => {
  const [newsItems, setNewsItems] = useState(() => getInitialTickerData().news)
  const [specialMessage, setSpecialMessage] = useState(() => getInitialTickerData().special)

  useEffect(() => {
    let isMounted = true

    // Fetch fresh data
    fetch(SHEET_URL)
      .then(response => response.text())
      .then(csvText => {
        if (!isMounted) return
        const rows = csvText.split('\n').filter((row) => row.trim() !== '')
        if (rows.length < 2) return

        const headers = rows[0].split(',').map((header) => header.trim().toLowerCase())

        const parsedData = rows.slice(1).map(row => {
          const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value) => value.replace(/^"|"$/g, '').trim())
          const obj = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })

        const newsData = parsedData.filter((item) => item.category && item.category.toLowerCase().includes('news')).reverse()
        const specialData = parsedData.find((item) => item.category && item.category.toLowerCase() === 'special')
        const specialMsg = specialData && specialData.title ? specialData.title : "आज सभी ऑनलाइन काम चालू हैं!"

        setNewsItems(newsData)
        setSpecialMessage(specialMsg)

        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            news: newsData,
            special: specialMsg,
            savedAt: Date.now(),
          }))
        } catch {
          // Ignore cache write error
        }
      })
      .catch((error) => console.error("Error fetching news:", error))

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="super-slim-ticker">
      {/* 🕒 Box 1: Time Box (isolated re-renders) */}
      <TickerClock />

      {/* 🔴 Box 2: Google Sheet se aane wala Special Message aur Laal Dot */}
      <div className="ticker-special-box">
        <span className="live-pulse-dot-red"></span>
        <span className="special-text">{specialMessage}</span>
      </div>

      {/* 📰 Box 3: Scrolling News */}
      <div className="ticker-news-scroll">
        <div className="ticker-news-move">
          {newsItems.length > 0 ? (
            newsItems.map((news, index) => (
              <React.Fragment key={index}>
                <a href={news.applylink || "#"} target="_blank" rel="noopener noreferrer" className="ticker-news-link">
                  {news.title}
                </a>
                <span className="ticker-separator">•</span>
              </React.Fragment>
            ))
          ) : (
            <>
               <span className="ticker-news-link" style={{color: '#64748b'}}>आज का अपडेट लोड हो रहा है...</span>
               <span className="ticker-separator">•</span>
            </>
          )}

          <Link href="/jobs" className="ticker-news-link highlight-link">
            सभी फॉर्म्स के लिए यहाँ क्लिक करें <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PanchangTicker;