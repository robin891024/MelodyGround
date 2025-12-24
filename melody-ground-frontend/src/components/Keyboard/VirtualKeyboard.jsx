import { useState, useEffect, useCallback } from 'react';
import audioService from '../../services/audioService';
import recordingService from '../../services/recordingService';
import './VirtualKeyboard.css';

const VirtualKeyboard = ({ instrument, octave, onNotePlay }) => {
  const [activeKeys, setActiveKeys] = useState(new Set());

  // 鍵盤配置 - 三排按鍵，每排 7 個（剛好一個八度 C-B）
  const keyboardLayout = {
    row1: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U'],
    row2: ['A', 'S', 'D', 'F', 'G', 'H', 'J'],
    row3: ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  };

  // 音符映射（C, D, E, F, G, A, B）
  const noteMapping = {
    row1: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    row2: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    row3: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  };

  // 根據按鍵取得音符
  const getNoteFromKey = useCallback((key) => {
    const upperKey = key.toUpperCase();
    
    // 檢查每一排
    for (const [row, keys] of Object.entries(keyboardLayout)) {
      const index = keys.indexOf(upperKey);
      if (index !== -1) {
        const note = noteMapping[row][index];
        let noteOctave = octave;
        
        // 第一排 (Q-U) 使用當前八度 + 1 (高八度)
        // 第二排 (A-J) 使用當前八度
        // 第三排 (Z-M) 使用當前八度 - 1 (低八度)
        if (row === 'row1') noteOctave += 1;
        if (row === 'row3') noteOctave -= 1;
        
        return `${note}${noteOctave}`;
      }
    }
    return null;
  }, [octave]);

  // 播放音符
  const playNote = useCallback((key) => {
    const note = getNoteFromKey(key);
    if (!note) return;

    // --- 優先執行音訊代碼（降低感知延遲） ---
    // 播放音效
    audioService.playNote(note, '8n');
    
    // 如果正在錄製，記錄音符
    if (recordingService.getIsRecording()) {
      recordingService.recordNote(note, instrument, 500, 100);
    }
    // ------------------------------------

    // 延後處理通知與 UI 更新
    setTimeout(() => {
      if (onNotePlay) {
        onNotePlay(note);
      }

      // 添加視覺回饋
      setActiveKeys(prev => new Set(prev).add(key.toUpperCase()));
      
      // 500ms 後移除高亮
      setTimeout(() => {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key.toUpperCase());
          return newSet;
        });
      }, 500);
    }, 0);
  }, [getNoteFromKey, instrument, onNotePlay]);

  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 避免重複觸發
      if (e.repeat) return;
      
      // 避免在輸入框中觸發
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      playNote(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playNote]);

  // 滑鼠點擊處理
  const handleKeyClick = (key) => {
    playNote(key);
  };

  // 渲染按鍵
  const renderKey = (key, note) => {
    const isActive = activeKeys.has(key);
    return (
      <button
        key={key}
        className={`keyboard-key ${isActive ? 'active' : ''}`}
        onClick={() => handleKeyClick(key)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="key-label">{key}</span>
        <span className="note-label">{note}</span>
      </button>
    );
  };

  return (
    <div className="virtual-keyboard">
      <div className="keyboard-row row-1">
        {keyboardLayout.row1.map((key, index) => {
          const note = `${noteMapping.row1[index]}${octave + 1}`;
          return renderKey(key, note);
        })}
      </div>
      <div className="keyboard-row row-2">
        {keyboardLayout.row2.map((key, index) => {
          const note = `${noteMapping.row2[index]}${octave}`;
          return renderKey(key, note);
        })}
      </div>
      <div className="keyboard-row row-3">
        {keyboardLayout.row3.map((key, index) => {
          const note = `${noteMapping.row3[index]}${octave - 1}`;
          return renderKey(key, note);
        })}
      </div>
    </div>
  );
};

export default VirtualKeyboard;
