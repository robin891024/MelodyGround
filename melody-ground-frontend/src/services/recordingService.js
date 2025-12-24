import * as Tone from 'tone';

class RecordingService {
  constructor() {
    this.isRecording = false;
    this.startTime = null;
    this.notes = [];
    this.tempo = 120;
    this.activeEvents = [];
  }

  // 開始錄製
  startRecording(tempo = 120) {
    this.isRecording = true;
    this.startTime = Tone.now() * 1000; // 使用 Tone 的精確時間
    this.notes = [];
    this.tempo = tempo;
    console.log('Recording started');
  }

  // 記錄音符
  recordNote(note, instrument, duration = 500, velocity = 100) {
    if (!this.isRecording) return;

    const timestamp = (Tone.now() * 1000) - this.startTime;
    this.notes.push({
      timestamp,
      note,
      instrument,
      duration,
      velocity
    });
  }

  // 停止錄製
  stopRecording() {
    this.isRecording = false;
    const totalDuration = (Tone.now() * 1000) - this.startTime;
    
    console.log(`Recording stopped. Total duration: ${totalDuration}ms, Notes: ${this.notes.length}`);
    
    return {
      notes: [...this.notes],
      duration: totalDuration,
      tempo: this.tempo
    };
  }

  // 播放錄製的音樂
  playRecording(recording, audioService) {
    if (!recording || !recording.notes || recording.notes.length === 0) {
      console.warn('No recording to play');
      return;
    }

    // 徹底清理之前的狀態
    Tone.Transport.stop();
    Tone.Transport.cancel(0); // 清除從 0 秒開始的所有排程
    
    console.log(`Scheduling playback for ${recording.notes.length} notes using Transport`);
    
    recording.notes.forEach(noteData => {
      // 確保排程的時間點是正數
      const startTime = Math.max(0, noteData.timestamp / 1000);
      
      Tone.Transport.schedule((time) => {
        audioService.playNote(
          noteData.note, 
          `${noteData.duration}ms`, 
          noteData.velocity / 127,
          noteData.instrument
        );
      }, startTime);
    });

    // 設定 Transport 速度
    Tone.Transport.bpm.value = recording.tempo || 120;
    
    // 啟動播放
    Tone.Transport.start("+0.1"); // 稍微延遲一點啟動，確保排程已就緒

    // 返回清理函數
    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
    };
  }

  // 檢查是否正在錄製
  getIsRecording() {
    return this.isRecording;
  }

  // 取得當前錄製的音符數量
  getNoteCount() {
    return this.notes.length;
  }

  // 清空錄製
  clear() {
    this.notes = [];
    this.isRecording = false;
    this.startTime = null;
  }
}

export default new RecordingService();
