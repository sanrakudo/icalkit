import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Splitter from './pages/Splitter';
import Merger from './pages/Merger';
import Licenses from './pages/Licenses';

// Google Analytics page view tracking for SPA navigation
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Send page view event to Google Analytics on route change
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/splitter" element={<Splitter />} />
        <Route path="/merger" element={<Merger />} />
        <Route path="/licenses" element={<Licenses />} />
      </Routes>
    </Router>
  );
}

export default App;
