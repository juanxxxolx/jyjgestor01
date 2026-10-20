import React from 'react';
import ReactDOM from 'react-dom/client';
import { message, ConfigProvider } from 'antd';
import App from './App';
import 'antd/dist/reset.css';

message.config({
  top: 24,
  maxCount: 3,
  rtl: false,
  duration: 3,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);