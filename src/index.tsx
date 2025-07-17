import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// ルート要素にアプリをレンダリング
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
