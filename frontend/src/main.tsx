import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/i18n'
import '@/styles/global.css'
import '@/styles/utilities.css'
import { App } from '@/app/App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Tell the splash screen the app is ready
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (typeof (window as Window & { __splashDone?: () => void }).__splashDone === 'function') {
      ;(window as Window & { __splashDone?: () => void }).__splashDone!()
    }
  })
})
