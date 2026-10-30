import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import './styles/base.css';
import './styles/three-d.css';
import './styles/components.css';
import './styles/landing.css';
import './styles/app.css';
import './styles/portfolio.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
