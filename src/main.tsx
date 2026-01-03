import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import store, { persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import './demos/ipc'

// Initialize axios interceptor for automatic server fallback
// Primary: api.27infinity.in, Fallback: api.27infinity.com
import './utils/axiosInterceptor'

// ✅ Import test utilities for development
import './utils/testPersistence'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* ✅ PersistGate delays app rendering until persisted state is retrieved */}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)


window.addEventListener('DOMContentLoaded', () => {
  postMessage({ payload: 'removeLoading' }, '*')
})
