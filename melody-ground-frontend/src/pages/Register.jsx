import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密碼長度至少為 6 個字元');
      return;
    }

    setLoading(true);

    try {
      await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      
      // 註冊成功後自動登入
      await authService.login(formData.username, formData.password);
      navigate('/compose');
    } catch (error) {
      console.error('Register error:', error);
      setError(error.response?.data?.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🎵 MelodyGround</h1>
          <p>建立您的帳號，開始音樂創作之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">使用者名稱 *</label>
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
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">電子郵件 *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="輸入電子郵件"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼 *</label>
            <input
              type="password"
              id="password"
              name="password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="輸入密碼（至少 6 個字元）"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">確認密碼 *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="auth-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="再次輸入密碼"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            已經有帳號？ <Link to="/login">立即登入</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
