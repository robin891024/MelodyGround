import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tone from 'tone'; // 新增這行
import VirtualKeyboard from '../components/Keyboard/VirtualKeyboard';
import ControlPanel from '../components/Controls/ControlPanel';
import audioService from '../services/audioService';
import recordingService from '../services/recordingService';
import { compositionService } from '../services/compositionService';
import { downloadMidi } from '../utils/midiExporter';
import { authService } from '../services/authService';
import './Compose.css';

const Compose = () => {
  const navigate = useNavigate();
  const [instrument, setInstrument] = useState('piano');
  const [octave, setOctave] = useState(4);
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(80); // 新增音量狀態，預設 80%
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0); // 新增加載進度
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [compositionTitle, setCompositionTitle] = useState('');
  const [compositionDescription, setCompositionDescription] = useState('');

  // 1. 背景自動載入音源庫 (一進頁面就開始)
  useEffect(() => {
    const loadAssets = async () => {
      try {
        console.log('Auto-loading instrument assets...');
        await audioService.initialize();
        
        // 啟動加載狀態檢查
        const checkLoading = setInterval(() => {
          const instruments = Object.values(audioService.instruments);
          const samplers = instruments.filter(inst => inst instanceof Tone.Sampler);
          const loadedSamplers = samplers.filter(inst => inst.loaded);
          
          const progress = samplers.length > 0 
            ? Math.round((loadedSamplers.length / samplers.length) * 100)
            : 100;
          
          setLoadProgress(progress);

          if (progress === 100) {
            setIsLoaded(true);
            clearInterval(checkLoading);
            console.log('All instruments successfully cached');
          }
        }, 100);
      } catch (error) {
        console.error('Failed to pre-load assets:', error);
      }
    };

    loadAssets();
  }, []);

  // 2. 使用者互動後啟動 Audio Context (瀏覽器安全要求)
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!isInitialized) {
        try {
          await Tone.start();
          setIsInitialized(true);
          console.log('Audio Context Started by user interaction');
          
          // 移除事件監聽
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('keydown', handleFirstInteraction);
        } catch (err) {
          console.error('Failed to start Audio Context:', err);
        }
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isInitialized]);

  // 切換樂器
  const handleInstrumentChange = (newInstrument) => {
    setInstrument(newInstrument);
    audioService.setInstrument(newInstrument);
  };

  // 調整音量
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    audioService.setMasterVolume(newVolume);
  };

  // 開始錄製
  const handleStartRecording = () => {
    if (!isInitialized) {
      alert('請先點擊任意按鍵以啟動音訊系統');
      return;
    }
    recordingService.startRecording(tempo);
    setIsRecording(true);
  };

  // 停止錄製
  const handleStopRecording = () => {
    const recording = recordingService.stopRecording();
    setCurrentRecording(recording);
    setIsRecording(false);
    console.log('Recording saved:', recording);
  };

  // 播放錄製
  const handlePlayRecording = () => {
    if (!currentRecording) {
      alert('沒有可播放的錄製');
      return;
    }
    recordingService.playRecording(currentRecording, audioService);
  };

  // 顯示儲存對話框
  const handleShowSaveDialog = () => {
    if (!currentRecording) {
      alert('沒有可儲存的錄製');
      return;
    }
    setShowSaveDialog(true);
  };

  // 儲存作品到後端
  const handleSaveComposition = async () => {
    if (!compositionTitle.trim()) {
      alert('請輸入作品標題');
      return;
    }

    try {
      const compositionData = {
        title: compositionTitle,
        description: compositionDescription,
        tempo: currentRecording.tempo,
        notes: currentRecording.notes
      };

      await compositionService.createComposition(compositionData);
      alert('作品儲存成功！');
      setShowSaveDialog(false);
      setCompositionTitle('');
      setCompositionDescription('');
    } catch (error) {
      console.error('Failed to save composition:', error);
      if (error.response?.status === 401) {
        alert('請先登入');
        navigate('/login');
      } else {
        alert('儲存失敗：' + (error.response?.data?.message || error.message));
      }
    }
  };

  // 匯出 MIDI
  const handleExportMidi = () => {
    if (!currentRecording) {
      alert('沒有可匯出的錄製');
      return;
    }

    try {
      const filename = compositionTitle || 'melody-ground-composition';
      downloadMidi(currentRecording, `${filename}.mid`);
    } catch (error) {
      console.error('Failed to export MIDI:', error);
      alert('匯出失敗：' + error.message);
    }
  };

  // 登出
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const currentUser = authService.getCurrentUser();

  return (
    <div className="compose-page">
      <header className="compose-header">
        <h1>🎵 MelodyGround</h1>
        <div className="header-actions">
          <span className="user-info">👤 {currentUser?.username}</span>
          <button onClick={() => navigate('/compositions')} className="nav-button">
            📚 我的作品
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 登出
          </button>
        </div>
      </header>

      <div className="compose-container">
        {!isInitialized && (
          <div className="init-overlay">
            <div className="init-alert">
              <div className="init-alert-icon">🎹</div>
              <h2>啟動音訊系統</h2>
              <p>為了提供最佳的音樂創作體驗，請點擊下方按鈕或頁面任意處以啟動音訊。</p>
              <div className="init-instructions">
                <p>💡 <strong>鍵盤操作說明：</strong></p>
                <ul style={{ textAlign: 'left', marginTop: '10px', lineHeight: '1.8' }}>
                  <li><strong>A-S-D-F-G-H-J</strong>：對應音符 C-D-E-F-G-A-B（當前八度）</li>
                  <li><strong>Q-W-E-R-T-Y-U</strong>：對應音符 C-D-E-F-G-A-B（高一個八度）</li>
                  <li><strong>Z-X-C-V-B-N-M</strong>：對應音符 C-D-E-F-G-A-B（低一個八度）</li>
                  <li>使用鍵盤按鍵可以快速演奏，無需點擊滑鼠！</li>
                </ul>
              </div>
              <button className="init-alert-btn">立即啟動</button>
            </div>
          </div>
        )}
        <div className="compose-main">
          <div className="keyboard-section">
            <div className="status-messages">
              {!isLoaded && (
                <div className="loading-notice">
                  ⌛ 正在背景加載樂器音色... ({loadProgress}%)
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${loadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <VirtualKeyboard
              instrument={instrument}
              octave={octave}
              onNotePlay={(note) => console.log('Played:', note)}
            />
            {isRecording && (
              <div className="recording-indicator">
                🔴 錄製中... ({recordingService.getNoteCount()} 個音符)
              </div>
            )}
            
            <div className="keyboard-bottom-controls">
              <div className="bottom-control-item">
                <label>🔊 主音量</label>
                <div className="volume-control-mini">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="volume-slider-mini"
                  />
                  <span className="volume-value-mini">{volume}%</span>
                </div>
              </div>
              
              <div className="bottom-control-item">
                <label>🎼 音域選擇</label>
                <select 
                  value={octave} 
                  onChange={(e) => setOctave(parseInt(e.target.value))}
                  className="octave-select-mini"
                >
                  <option value={2}>低音 (2)</option>
                  <option value={3}>中低音 (3)</option>
                  <option value={4}>中音 (4)</option>
                  <option value={5}>中高音 (5)</option>
                  <option value={6}>高音 (6)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <aside className="compose-sidebar">
          <ControlPanel
            instrument={instrument}
            tempo={tempo}
            isRecording={isRecording}
            onInstrumentChange={handleInstrumentChange}
            onTempoChange={setTempo}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPlayRecording={handlePlayRecording}
            onSaveComposition={handleShowSaveDialog}
            onExportMidi={handleExportMidi}
            hasRecording={!!currentRecording}
          />
        </aside>
      </div>

      {/* 儲存對話框 */}
      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💾 儲存作品</h2>
            <div className="form-group">
              <label>作品標題 *</label>
              <input
                type="text"
                value={compositionTitle}
                onChange={(e) => setCompositionTitle(e.target.value)}
                placeholder="輸入作品標題"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>作品描述</label>
              <textarea
                value={compositionDescription}
                onChange={(e) => setCompositionDescription(e.target.value)}
                placeholder="輸入作品描述（選填）"
                rows="4"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveComposition} className="save-btn">
                儲存
              </button>
              <button onClick={() => setShowSaveDialog(false)} className="cancel-btn">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compose;
