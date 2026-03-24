import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import News from './pages/News'
import Podcasts from './pages/Podcasts'
import Profile from './pages/member/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/adhesion" element={<Register />} />
              <Route path="/actualites" element={<News />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route path="/members/profil" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

