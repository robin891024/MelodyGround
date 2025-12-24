import MidiWriter from 'midi-writer-js';

// 將音符名稱轉換為 MIDI 音符編號
const convertToMidiNote = (noteName) => {
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7,
    'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  // 解析音符名稱（如 'C4', 'D#5'）
  const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) {
    console.warn(`Invalid note name: ${noteName}`);
    return 60; // 預設為 C4
  }

  const note = match[1];
  const octave = parseInt(match[2]);

  return (octave + 1) * 12 + noteMap[note];
};

// 計算 MIDI 持續時間
const calculateMidiDuration = (durationMs) => {
  // 將毫秒轉換為 MIDI 時間單位
  // 假設 1 拍 = 500ms (120 BPM)
  const beatsPerMs = 1 / 500;
  const beats = durationMs * beatsPerMs;
  
  // 轉換為 MIDI 記號
  if (beats >= 4) return '1'; // 全音符
  if (beats >= 2) return '2'; // 二分音符
  if (beats >= 1) return '4'; // 四分音符
  if (beats >= 0.5) return '8'; // 八分音符
  return '16'; // 十六分音符
};

// 匯出為 MIDI 檔案
export const exportToMidi = (recording, title = 'MelodyGround Composition') => {
  if (!recording || !recording.notes || recording.notes.length === 0) {
    throw new Error('No notes to export');
  }

  const track = new MidiWriter.Track();
  
  // 設定速度
  track.setTempo(recording.tempo || 120);
  
  // 設定音軌名稱
  track.addEvent(new MidiWriter.TrackNameEvent({ text: title }));

  // 按時間戳排序音符
  const sortedNotes = [...recording.notes].sort((a, b) => a.timestamp - b.timestamp);

  // 將音符轉換為 MIDI 事件
  let currentTick = 0;
  
  sortedNotes.forEach((note, index) => {
    const midiNote = convertToMidiNote(note.note);
    const duration = calculateMidiDuration(note.duration);
    
    // 計算與上一個音符的時間差
    const wait = index === 0 ? 0 : note.timestamp - sortedNotes[index - 1].timestamp;
    
    if (wait > 0) {
      // 添加等待時間
      const waitDuration = calculateMidiDuration(wait);
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: [midiNote],
        duration: waitDuration,
        velocity: note.velocity || 100,
        wait: waitDuration
      }));
    } else {
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: [midiNote],
        duration: duration,
        velocity: note.velocity || 100
      }));
    }
  });

  // 建立 MIDI 檔案
  const write = new MidiWriter.Writer(track);
  return write.buildFile();
};

// 下載 MIDI 檔案
export const downloadMidi = (recording, filename = 'melody-ground-composition.mid') => {
  try {
    const midiData = exportToMidi(recording);
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`MIDI file downloaded: ${filename}`);
  } catch (error) {
    console.error('Error exporting MIDI:', error);
    throw error;
  }
};
