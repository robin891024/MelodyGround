import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.username, formData.password);
      navigate('/compose');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || '登入失敗，請檢查帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🎵 MelodyGround</h1>
          <p>歡迎回來！請登入您的帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">使用者名稱</label>
            <input
              type="text"
              id="username"
              name="username"
              className="auth-input"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              placeholder="輸入使用者名稱"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="輸入密碼"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            還沒有帳號？ <Link to="/register">立即註冊</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
