import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Splitter from './pages/Splitter';
import Licenses from './pages/Licenses';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/splitter" element={<Splitter />} />
        <Route path="/licenses" element={<Licenses />} />
      </Routes>
    </Router>
  );
}

export default App;
