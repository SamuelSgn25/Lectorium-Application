import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import Podcasts from './pages/Podcasts';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col pt-24 font-sans text-stone-800 bg-[#fdfbf7]">
          <Navbar />
          <main className="flex-grow flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/news" element={<News />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/events" element={<Events />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <footer className="w-full py-8 mt-auto border-t border-stone-200 text-center text-sm text-stone-500">
            <p> Lectorium Rosicrucianum - École Spirituelle de la Rose-Croix d'Or.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
