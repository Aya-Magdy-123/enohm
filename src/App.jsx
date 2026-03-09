import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import EnohmForm from './EnohmForm';
import DashboardLayout from './components/DashboardLayout';
import Main from './dashboards/admin/Main';
import Requests from './dashboards/admin/Requests';
import './i18n';
import Login from './Login';
import Construction from './components/Construction';
import Cladding from './components/Cladding';
import Renovation from './components/Renovation';
import HomePreparation from './components/Homepreparation';
import Employees from './dashboards/admin/Employees';
import Home from './dashboards/employee/Home';
import EmployeeRequests from './dashboards/employee/EmployeeRequests';
import { auth } from './firebase';
import AdminSettings from './dashboards/admin/AdminSettings';
import EmployeeSettings from './dashboards/employee/EmployeeSettings';



// Protected Route
function ProtectedRoute({ children }) {
  const user = auth.currentUser;
  const role = user ? user.getIdTokenResult().then(tokenResult => tokenResult.claims.role) : null;
  
  return role !== null ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quote" element={<EnohmForm />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/construction" element={<Construction />} />
        <Route path="/cladding" element={<Cladding />} />
        <Route path="/renovation" element={<Renovation />} />
        <Route path="/home-preparation" element={<HomePreparation />} />


        
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
          <Route path="employees" element={<Employees />} />
          <Route path="home" element={<Home />} />
          <Route path="employeeRequests" element={<EmployeeRequests />} />
          <Route path="adminSettings" element={<AdminSettings />} />
          <Route path="employeeSettings" element={<EmployeeSettings />} />
        </Route>

        
      </Routes>
    </Router>
  );
}

export default App;