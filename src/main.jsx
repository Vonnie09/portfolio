import React from 'react'
import ReactDOM from 'react-dom/client'
import './perf' // decides early whether to use the light look
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
