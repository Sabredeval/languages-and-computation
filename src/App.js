import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

import Navigation from './components/common/Navigation';

import Home from './pages/Home';
import FiniteAutomata from './pages/FA/index.js';
// import SubsetConstructionPage from './pages/FA/SubsetContructionPage.js';
import PumpingLemma from './pages/PumpingLemma';
import CFGrammar from './pages/CFG/CFGrammar';
import PushdownAutomata from './pages/PushdownAutomata';
import TuringMachine from './pages/TuringMachine';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fa" element={<FiniteAutomata />} />
            {/* <Route path="/fa/subset-construction" element={<SubsetConstructionPage />} /> */}
            <Route path="/cfg" element={<CFGrammar />} />
            <Route path="/pa" element={<PushdownAutomata />} />
            <Route path="/tm" element={<TuringMachine />} />
            <Route path="/pl" element={<PumpingLemma />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;