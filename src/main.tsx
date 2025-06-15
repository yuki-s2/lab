import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/style/Recet.css'
import '../src/style/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
