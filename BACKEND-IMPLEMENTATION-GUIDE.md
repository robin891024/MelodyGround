# MelodyGround 後端實作指南

後端使用 Spring Boot 3.2.0 與 Java 17 建置，提供 RESTful API 並使用 JWT 進行安全驗證。

## 技術棧

- **Spring Boot 3.2.0**
- **Spring Security** (JWT 認證)
- **Spring Data JPA** (MySQL 整合)
- **Lombok** (簡化代碼)
- **JJWT** (JWT 生成與解析)
- **MySQL 8.0**

## 已實作的模組

### 1. 認證系統 (Authentication)
- ✅ `JwtTokenProvider`: 負責 JWT 的生成、解析與驗證。
- ✅ `JwtAuthenticationFilter`: 攔截請求並驗證 Token。
- ✅ `SecurityConfig`: 配置安全過濾鏈與跨域 (CORS) 設定。
- ✅ `AuthService`: 處理註冊、登入邏輯。
- ✅ `AuthController`: 提供 `/api/auth/register` 與 `/api/auth/login` 端點。

### 2. 音樂作品管理 (Composition)
- ✅ `Composition`: 音樂作品主實體。
- ✅ `NoteSequence`: 儲存作品中的音符序列。
- ✅ `CompositionService`: 處理作品的建立、查詢與刪除邏輯，包含權限檢查。
- ✅ `CompositionController`: 提供 `/api/compositions` 相關 REST 端點。

### 3. 資料庫整合
- ✅ `UserRepository` & `CompositionRepository`: 資料存取層。
- ✅ `application.properties`: 已配置 MySQL 連線資訊 (root/root)。

## 如何啟動後端

1. 確保 MySQL 服務已啟動，且 `melodyground` 資料庫已建立。
2. 進入後端目錄並執行 Maven 指令：
   ```bash
   cd melody-ground-backend
   mvn spring-boot:run
   ```

## API 端點摘要

### 公開端點
- `POST /api/auth/register`: 註冊新帳號。
- `POST /api/auth/login`: 登入並取得 Token。

### 需要認證 (Authorization: Bearer <TOKEN>)
- `GET /api/auth/me`: 取得當前登入使用者資訊。
- `GET /api/compositions`: 取得該使用者的所有作品。
- `POST /api/compositions`: 儲存新作品。
- `DELETE /api/compositions/{id}`: 刪除作品。

## 注意事項

- Lombok 報錯：如果在 IDE 中看到 `builder()` 或 `getter/setter` 報錯，請確保已安裝 Lombok 插件並啟動 Annotation Processing。
- JWT 密鑰：目前密鑰硬編碼在 `application.properties` 中，生產環境應使用環境變數。
