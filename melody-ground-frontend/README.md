# MelodyGround Frontend

MelodyGround 音樂創作平台的前端應用程式，使用 React + Vite 建置。

## 功能特色

- 🎹 **虛擬鍵盤** - 三排按鍵，支援鍵盤和滑鼠操作
- 🎵 **多種樂器** - 鋼琴、合成器、吉他、貝斯、鼓
- 🎼 **音域切換** - 支援低音、中音、高音切換
- 🎙️ **即時錄製** - 記錄按鍵序列和時間戳
- ▶️ **播放功能** - 重播錄製的音樂
- 💾 **雲端儲存** - 作品儲存到後端資料庫
- 📥 **MIDI 匯出** - 匯出為 MIDI 檔案
- 👤 **使用者系統** - 註冊、登入、JWT 認證

## 技術棧

- **React 18** - UI 框架
- **Vite** - 建置工具
- **React Router** - 路由管理
- **Axios** - HTTP 客戶端
- **Tone.js** - 音訊處理和合成
- **MidiWriterJS** - MIDI 檔案生成

## 開始使用

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

應用程式將在 http://localhost:5173 啟動

### 建置生產版本

```bash
npm run build
```

### 預覽建置結果

```bash
npm run preview
```

## 專案結構

```
src/
├── components/          # React 元件
│   ├── Auth/           # 認證相關元件
│   ├── Keyboard/       # 虛擬鍵盤元件
│   ├── Controls/       # 控制面板元件
│   └── Common/         # 共用元件
├── pages/              # 頁面元件
│   ├── Login.jsx       # 登入頁面
│   ├── Register.jsx    # 註冊頁面
│   ├── Compose.jsx     # 創作頁面
│   └── Compositions.jsx # 作品列表頁面
├── services/           # API 服務
│   ├── api.js          # Axios 配置
│   ├── authService.js  # 認證服務
│   ├── compositionService.js # 作品服務
│   ├── audioService.js # 音訊服務
│   └── recordingService.js # 錄製服務
├── utils/              # 工具函式
│   └── midiExporter.js # MIDI 匯出工具
├── hooks/              # 自訂 Hooks
├── context/            # React Context
├── App.jsx             # 主應用程式元件
└── main.jsx            # 應用程式入口
```

## 鍵盤配置

### 第一排（高音）
Q W E R T Y U I O P

### 第二排（中高音）
A S D F G H J K L

### 第三排（低音）
Z X C V B N M

## API 端點

前端預設連接到 `http://localhost:8080/api`

可以在 `src/services/api.js` 中修改 API 基礎 URL。

## 環境變數

可以建立 `.env` 檔案來設定環境變數：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 瀏覽器支援

- Chrome (推薦)
- Firefox
- Edge
- Safari

**注意：** 需要支援 Web Audio API 的現代瀏覽器。

## 開發注意事項

1. **音訊初始化** - 現代瀏覽器需要使用者互動才能啟動音訊系統
2. **CORS 設定** - 確保後端正確設定 CORS
3. **JWT Token** - Token 儲存在 localStorage
4. **鍵盤事件** - 在輸入框中不會觸發鍵盤音效

## 授權

MIT License
