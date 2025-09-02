import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/performance'
import { initPerformanceBudgetMonitoring } from './utils/performanceBudget'

// Initialize performance budget monitoring
initPerformanceBudgetMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
