import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import EnohmForm from './EnohmForm';
import DashboardLayout from './components/DashboardLayout';
import Main from './admin/Main';
import Requests from './admin/Requests';
import './i18n';
import Login from './Login';

// Protected Route
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quote" element={<EnohmForm />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Main />} />
          <Route path="requests" element={<Requests />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;