import React from 'react';
import { createRoot } from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App';

// Inject Vercel Speed Insights (client-side only)
injectSpeedInsights();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
