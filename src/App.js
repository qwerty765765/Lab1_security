import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Form from './pages/Form';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              🛡️ SecurityHub
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Главная</Link>
              <Link to="/add" className="nav-link">Добавить объект</Link>
            </div>
          </div>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/add" element={<Form />} />
            <Route path="/edit/:id" element={<Form />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
