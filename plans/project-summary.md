# MelodyGround 專案摘要

## 專案資訊

- **專案名稱**: MelodyGround 音樂創作平台
- **專案位置**: `D:\MelodyGround`
- **資料庫**: melodyground (已建立)
- **資料庫帳號**: root
- **資料庫密碼**: root

## 技術棧

### 前端
- **框架**: React 18+
- **建置工具**: Vite
- **語言**: JavaScript
- **主要套件**:
  - `react-router-dom` - 路由管理
  - `axios` - HTTP 請求
  - `tone` - 音訊處理
  - `midi-writer-js` - MIDI 檔案生成
  - `tailwindcss` - CSS 框架（可選）

### 後端
- **框架**: Spring Boot 3.x
- **語言**: Java 17+
- **建置工具**: Maven
- **主要依賴**:
  - Spring Web
  - Spring Security
  - Spring Data JPA
  - MySQL Driver
  - JWT (jjwt)
  - Lombok
  - Validation

### 資料庫
- **類型**: MySQL 8.0+
- **資料庫名稱**: melodyground
- **字元集**: utf8mb4

## 核心功能

### 1. 使用者系統
- 使用者註冊
- 使用者登入
- JWT Token 認證
- 使用者資訊管理

### 2. 虛擬鍵盤
- 三排按鍵配置（Q-P, A-L, Z-M）
- 支援鍵盤和滑鼠操作
- 即時音效回饋
- 視覺按鍵高亮

### 3. 音樂創作
- 多種樂器選擇（鋼琴、吉他、鼓等）
- 音域切換（低音、中音、高音）
- 即時錄製功能
- 播放錄製的音樂
- 速度調整（BPM）

### 4. 檔案匯出
- MIDI 格式匯出（用於編輯）
- WAV/MP3 格式匯出（用於分享）

### 5. 作品管理
- 儲存作品到雲端資料庫
- 作品列表瀏覽
- 載入作品繼續編輯
- 刪除作品

## 資料庫結構

### users 資料表
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### compositions 資料表
```sql
CREATE TABLE compositions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tempo INT NOT NULL DEFAULT 120,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### note_sequences 資料表
```sql
CREATE TABLE note_sequences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    composition_id BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    note VARCHAR(10) NOT NULL,
    instrument VARCHAR(50) NOT NULL,
    duration INT NOT NULL,
    velocity INT NOT NULL DEFAULT 100,
    FOREIGN KEY (composition_id) REFERENCES compositions(id) ON DELETE CASCADE
);
```

## API 端點

### 認證 API
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/auth/me` - 取得當前使用者

### 作品 API
- `GET /api/compositions` - 取得所有作品
- `GET /api/compositions/{id}` - 取得單一作品
- `POST /api/compositions` - 建立作品
- `PUT /api/compositions/{id}` - 更新作品
- `DELETE /api/compositions/{id}` - 刪除作品
- `GET /api/compositions/{id}/export/midi` - 匯出 MIDI

## 專案結構

```
D:\MelodyGround\
├── melody-ground-frontend\          # React 前端
│   ├── src\
│   │   ├── components\
│   │   │   ├── Auth\               # 認證元件
│   │   │   ├── Keyboard\           # 鍵盤元件
│   │   │   ├── Controls\           # 控制面板
│   │   │   └── Common\             # 共用元件
│   │   ├── pages\                  # 頁面元件
│   │   ├── services\               # API 服務
│   │   ├── utils\                  # 工具函式
│   │   ├── hooks\                  # 自訂 Hooks
│   │   └── context\                # React Context
│   ├── package.json
│   └── vite.config.js
│
├── melody-ground-backend\           # Spring Boot 後端
│   ├── src\main\java\com\melodyground\
│   │   ├── config\                 # 配置類別
│   │   ├── controller\             # 控制器
│   │   ├── dto\                    # 資料傳輸物件
│   │   ├── model\                  # 實體類別
│   │   ├── repository\             # 資料存取層
│   │   ├── security\               # 安全相關
│   │   └── service\                # 業務邏輯層
│   ├── src\main\resources\
│   │   └── application.properties
│   └── pom.xml
│
└── plans\                           # 規劃文件
    ├── architecture-plan.md
    ├── technical-specifications.md
    ├── quick-start-guide.md
    └── project-summary.md
```

## 開發順序建議

### 階段一：基礎建設
1. ✅ 建立資料庫（已完成）
2. 建立後端 Spring Boot 專案
3. 建立前端 React + Vite 專案
4. 配置資料庫連線
5. 設定 CORS

### 階段二：後端開發
1. 建立實體類別（User, Composition, NoteSequence）
2. 建立 Repository 介面
3. 實作 JWT 認證系統
4. 實作使用者註冊登入 API
5. 實作音樂作品 CRUD API

### 階段三：前端基礎
1. 建立路由結構
2. 建立登入註冊頁面
3. 實作 API 服務層
4. 實作認證狀態管理

### 階段四：音樂功能
1. 建立虛擬鍵盤元件
2. 整合 Tone.js 音訊播放
3. 實作樂器切換
4. 實作音域切換
5. 實作錄製功能
6. 實作播放功能

### 階段五：檔案處理
1. 實作 MIDI 匯出
2. 實作音訊錄製
3. 實作 WAV/MP3 匯出

### 階段六：整合與優化
1. 前後端整合測試
2. UI/UX 優化
3. 錯誤處理完善
4. 效能優化

## 配置資訊

### 後端配置 (application.properties)
```properties
# 資料庫配置
spring.datasource.url=jdbc:mysql://localhost:3306/melodyground?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Taipei
spring.datasource.username=root
spring.datasource.password=root

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT 配置
jwt.secret=MelodyGroundSecretKeyForJWTTokenGenerationMustBeLongEnough
jwt.expiration=86400000

# 伺服器配置
server.port=8080

# CORS 配置
cors.allowed-origins=http://localhost:5173
```

### 前端配置
- 開發伺服器：http://localhost:5173
- API 端點：http://localhost:8080/api

## 重要注意事項

1. **音訊權限**: 現代瀏覽器需要使用者互動才能啟動音訊
2. **CORS 設定**: 確保後端正確設定 CORS 允許前端存取
3. **JWT Token**: 儲存在 localStorage，設定合理的過期時間
4. **檔案大小**: 限制音訊檔案和 MIDI 檔案的大小
5. **瀏覽器相容性**: 測試 Chrome、Firefox、Edge 的相容性

## 測試重點

### 功能測試
- [ ] 使用者註冊登入流程
- [ ] 虛擬鍵盤按鍵響應
- [ ] 音訊即時播放
- [ ] 錄製和播放功能
- [ ] 樂器和音域切換
- [ ] MIDI 檔案匯出
- [ ] 音訊檔案匯出
- [ ] 作品儲存和載入
- [ ] 作品編輯和刪除

### 效能測試
- [ ] 長時間錄製的效能
- [ ] 大量音符的播放效能
- [ ] API 回應時間
- [ ] 資料庫查詢效能

### 安全測試
- [ ] JWT Token 驗證
- [ ] API 權限控制
- [ ] SQL 注入防護
- [ ] XSS 防護

## 參考文件

- [架構規劃](./architecture-plan.md) - 詳細的系統架構設計
- [技術規格](./technical-specifications.md) - 完整的程式碼範例
- [快速開始](./quick-start-guide.md) - 環境設定和初始化步驟

## 下一步行動

現在資料庫已經準備好，建議的下一步是：

1. **建立後端專案** - 使用 Spring Initializr 建立 Spring Boot 專案
2. **建立前端專案** - 使用 Vite 建立 React 專案
3. **配置專案** - 設定資料庫連線和基本配置
4. **開始開發** - 按照開發順序逐步實作功能

準備好後，可以切換到 **Code 模式**開始建立專案！
