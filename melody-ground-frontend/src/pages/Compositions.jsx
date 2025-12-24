import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { compositionService } from '../services/compositionService';
import { authService } from '../services/authService';
import './Compositions.css';

const Compositions = () => {
  const navigate = useNavigate();
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompositions();
  }, []);

  const loadCompositions = async () => {
    try {
      setLoading(true);
      const data = await compositionService.getAllCompositions();
      setCompositions(data);
    } catch (error) {
      console.error('Failed to load compositions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('載入作品失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`確定要刪除作品「${title}」嗎？`)) {
      return;
    }

    try {
      await compositionService.deleteComposition(id);
      setCompositions(compositions.filter(c => c.id !== id));
      alert('作品已刪除');
    } catch (error) {
      console.error('Failed to delete composition:', error);
      alert('刪除失敗');
    }
  };

  const handleExportMidi = async (id, title) => {
    try {
      const blob = await compositionService.exportMidi(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export MIDI:', error);
      alert('匯出失敗');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentUser = authService.getCurrentUser();

  return (
    <div className="compositions-page">
      <header className="compositions-header">
        <h1>🎵 我的作品</h1>
        <div className="header-actions">
          <span className="user-info">👤 {currentUser?.username}</span>
          <button onClick={() => navigate('/compose')} className="nav-button">
            ✏️ 創作音樂
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 登出
          </button>
        </div>
      </header>

      <div className="compositions-container">
        {loading ? (
          <div className="loading">載入中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : compositions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎼</div>
            <h2>還沒有作品</h2>
            <p>開始創作您的第一首音樂吧！</p>
            <button onClick={() => navigate('/compose')} className="create-button">
              ✏️ 開始創作
            </button>
          </div>
        ) : (
          <div className="compositions-grid">
            {compositions.map((composition) => (
              <div key={composition.id} className="composition-card">
                <div className="card-header">
                  <h3>{composition.title}</h3>
                  <span className="tempo-badge">♩ = {composition.tempo}</span>
                </div>
                
                {composition.description && (
                  <p className="card-description">{composition.description}</p>
                )}
                
                <div className="card-info">
                  <span className="note-count">
                    🎵 {composition.noteSequences?.length || 0} 個音符
                  </span>
                  <span className="created-date">
                    📅 {formatDate(composition.createdAt)}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleExportMidi(composition.id, composition.title)}
                    className="action-button export-button"
                    title="匯出 MIDI"
                  >
                    📥 匯出
                  </button>
                  <button
                    onClick={() => handleDelete(composition.id, composition.title)}
                    className="action-button delete-button"
                    title="刪除作品"
                  >
                    🗑️ 刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compositions;
