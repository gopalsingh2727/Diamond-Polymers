import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import  store  from './store'
import './demos/ipc'

// Initialize axios interceptor for automatic server fallback
// Primary: api.27infinity.in, Fallback: api.27infinity.com
import './utils/axiosInterceptor'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </React.StrictMode>,
)


window.addEventListener('DOMContentLoaded', () => {
  postMessage({ payload: 'removeLoading' }, '*')
})
