import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Login from './pages/Login';
import Register from './pages/Register';
import Compose from './pages/Compose';
import Compositions from './pages/Compositions';

// 受保護的路由元件
const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// 公開路由元件（已登入則重定向）
const PublicRoute = ({ children }) => {
  return !authService.isAuthenticated() ? children : <Navigate to="/compose" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 公開路由 */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* 受保護的路由 */}
        <Route 
          path="/compose" 
          element={
            <PrivateRoute>
              <Compose />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/compositions" 
          element={
            <PrivateRoute>
              <Compositions />
            </PrivateRoute>
          } 
        />

        {/* 預設路由 */}
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? 
              <Navigate to="/compose" /> : 
              <Navigate to="/login" />
          } 
        />

        {/* 404 路由 */}
        <Route 
          path="*" 
          element={<Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
