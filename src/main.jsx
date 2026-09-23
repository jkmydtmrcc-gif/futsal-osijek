import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ContentProvider } from './lib/content';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';
import './admin/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ContentProvider>
          <App />
        </ContentProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
