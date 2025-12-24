import { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = ({
  instrument,
  tempo,
  isRecording,
  onInstrumentChange,
  onTempoChange,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onSaveComposition,
  onExportMidi,
  hasRecording
}) => {
  const instruments = [
    { value: 'piano', label: '🎹 鋼琴' },
    { value: 'synth', label: '🎛️ 合成器' },
    { value: 'guitar', label: '🎸 吉他' },
    { value: 'bass', label: '🎸 電貝斯' }
  ];

  return (
    <div className="control-panel">
      <div className="control-section">
        <h3>🎵 樂器選擇</h3>
        <select 
          value={instrument} 
          onChange={(e) => onInstrumentChange(e.target.value)}
          className="control-select"
        >
          {instruments.map(inst => (
            <option key={inst.value} value={inst.value}>
              {inst.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-section">
        <h3>⏱️ 速度 (BPM)</h3>
        <div className="tempo-control">
          <input
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value))}
            className="tempo-slider"
          />
          <span className="tempo-value">{tempo}</span>
        </div>
      </div>

      <div className="control-section">
        <h3>🎙️ 錄製控制</h3>
        <div className="button-group">
          {!isRecording ? (
            <button 
              onClick={onStartRecording}
              className="control-button record-button"
            >
              ⏺️ 開始錄製
            </button>
          ) : (
            <button 
              onClick={onStopRecording}
              className="control-button stop-button"
            >
              ⏹️ 停止錄製
            </button>
          )}
          
          <button 
            onClick={onPlayRecording}
            disabled={!hasRecording || isRecording}
            className="control-button play-button"
          >
            ▶️ 播放
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>💾 儲存與匯出</h3>
        <div className="button-group">
          <button 
            onClick={onSaveComposition}
            disabled={!hasRecording}
            className="control-button save-button"
          >
            💾 儲存作品
          </button>
          
          <button 
            onClick={onExportMidi}
            disabled={!hasRecording}
            className="control-button export-button"
          >
            📥 匯出 MIDI
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
