import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Test from './Test.tsx'

const rootElement = document.getElementById("root")!;
const path = window.location.pathname;

createRoot(rootElement).render(
  <StrictMode>
    {path === "/test" && <Test />}
    {path === "/" && <App />}
  </StrictMode>
);
