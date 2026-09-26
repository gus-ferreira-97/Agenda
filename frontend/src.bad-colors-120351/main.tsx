import './instrument';
import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react';
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Ocorreu um erro inesperado. A equipe foi notificada.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)