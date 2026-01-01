import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Splitter from './pages/Splitter';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/splitter" element={<Splitter />} />
      </Routes>
    </Router>
  );
}

export default App;
