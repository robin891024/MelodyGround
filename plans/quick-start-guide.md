# MelodyGround 快速開始指南

## 前置準備

### 必要軟體安裝

1. **Node.js** (v18 或以上)
   - 下載：https://nodejs.org/
   - 驗證安裝：`node --version` 和 `npm --version`

2. **Java JDK** (v17 或以上)
   - 下載：https://www.oracle.com/java/technologies/downloads/
   - 驗證安裝：`java --version`

3. **Maven** (v3.8 或以上)
   - 下載：https://maven.apache.org/download.cgi
   - 驗證安裝：`mvn --version`

4. **MySQL** (v8.0 或以上)
   - 下載：https://dev.mysql.com/downloads/mysql/
   - 或使用 XAMPP/WAMP

5. **IDE 建議**
   - 前端：VS Code
   - 後端：IntelliJ IDEA 或 Eclipse

---

## 第一步：建立資料庫

### 1. 啟動 MySQL 服務

```bash
# Windows (使用 XAMPP)
# 啟動 XAMPP Control Panel，點擊 MySQL 的 Start

# 或使用命令列
net start MySQL80
```

### 2. 建立資料庫

```sql
-- 連線到 MySQL
mysql -u root -p

-- 建立資料庫
CREATE DATABASE melodyground CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 建立使用者（可選）
CREATE USER 'melodyground_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON melodyground.* TO 'melodyground_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

---

## 第二步：建立後端專案

### 1. 使用 Spring Initializr

訪問 https://start.spring.io/ 並設定：

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.2.x (最新穩定版)
- **Project Metadata**:
  - Group: `com.melodyground`
  - Artifact: `melody-ground-backend`
  - Name: `melody-ground-backend`
  - Package name: `com.melodyground`
  - Packaging: `Jar`
  - Java: `17`

- **Dependencies**:
  - Spring Web
  - Spring Security
  - Spring Data JPA
  - MySQL Driver
  - Lombok
  - Validation

點擊 **Generate** 下載專案壓縮檔。

### 2. 解壓並開啟專案

```bash
# 在 D:\MelodyGround 目錄下
# 解壓下載的 zip 檔案到 melody-ground-backend 資料夾

cd melody-ground-backend
```

### 3. 配置 application.properties

編輯 [`src/main/resources/application.properties`](src/main/resources/application.properties)：

```properties
spring.application.name=melody-ground-backend

# 資料庫配置
spring.datasource.url=jdbc:mysql://localhost:3306/melodyground?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Taipei
spring.datasource.username=root
spring.datasource.password=你的MySQL密碼
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT 配置
jwt.secret=MelodyGroundSecretKeyForJWTTokenGenerationMustBeLongEnough
jwt.expiration=86400000

# 伺服器配置
server.port=8080

# CORS 配置
cors.allowed-origins=http://localhost:5173
```

### 4. 添加 JWT 依賴

編輯 [`pom.xml`](pom.xml)，在 `<dependencies>` 區塊中添加：

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

### 5. 測試後端啟動

```bash
# 使用 Maven 啟動
mvn spring-boot:run

# 或在 IDE 中執行 MelodyGroundApplication.java
```

如果看到 "Started MelodyGroundApplication" 訊息，表示後端啟動成功！

---

## 第三步：建立前端專案

### 1. 建立 Vite + React 專案

```bash
# 在 D:\MelodyGround 目錄下
npm create vite@latest melody-ground-frontend -- --template react

cd melody-ground-frontend
```

### 2. 安裝依賴

```bash
# 安裝基本依賴
npm install

# 安裝專案所需套件
npm install react-router-dom axios tone midi-writer-js

# 安裝 Tailwind CSS（可選，用於樣式）
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. 配置 Tailwind CSS（可選）

編輯 [`tailwind.config.js`](tailwind.config.js)：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

編輯 [`src/index.css`](src/index.css)，添加：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. 建立基本目錄結構

```bash
# 在 melody-ground-frontend/src 目錄下建立資料夾
mkdir components pages services utils hooks context
mkdir components/Auth components/Keyboard components/Controls components/Common
```

### 5. 測試前端啟動

```bash
npm run dev
```

瀏覽器開啟 http://localhost:5173，如果看到 Vite + React 頁面，表示前端啟動成功！

---

## 第四步：建立基本檔案結構

### 後端檔案結構

在 [`src/main/java/com/melodyground/`](src/main/java/com/melodyground/) 下建立以下套件：

```
com.melodyground/
├── config/
├── controller/
├── dto/
├── model/
├── repository/
├── security/
└── service/
```

### 前端檔案結構

在 [`src/`](src/) 下應該有：

```
src/
├── assets/
├── components/
│   ├── Auth/
│   ├── Keyboard/
│   ├── Controls/
│   └── Common/
├── pages/
├── services/
├── utils/
├── hooks/
├── context/
├── App.jsx
├── main.jsx
└── index.css
```

---

## 第五步：驗證環境設定

### 檢查清單

- [ ] MySQL 服務正在運行
- [ ] 資料庫 `melodyground` 已建立
- [ ] 後端專案可以成功啟動（port 8080）
- [ ] 前端專案可以成功啟動（port 5173）
- [ ] 所有必要的依賴都已安裝

### 測試連線

1. **測試後端健康檢查**（建立後）
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **測試前端可以訪問**
   - 瀏覽器開啟 http://localhost:5173

---

## 開發工作流程建議

### 1. 後端優先開發

建議順序：
1. 建立 Model 實體類別
2. 建立 Repository 介面
3. 建立 Service 業務邏輯
4. 建立 Controller API 端點
5. 使用 Postman 測試 API

### 2. 前端開發

建議順序：
1. 建立路由結構
2. 建立頁面元件
3. 建立 API 服務
4. 整合後端 API
5. 實作音訊功能

### 3. 整合測試

1. 測試使用者註冊登入流程
2. 測試音樂創作和儲存
3. 測試檔案匯出功能

---

## 常見問題排解

### 問題 1：後端無法連線資料庫

**解決方案：**
- 確認 MySQL 服務正在運行
- 檢查 [`application.properties`](application.properties) 中的資料庫連線資訊
- 確認資料庫使用者權限

### 問題 2：前端無法呼叫後端 API

**解決方案：**
- 檢查 CORS 設定
- 確認後端正在運行
- 檢查 API URL 是否正確

### 問題 3：音訊無法播放

**解決方案：**
- 確認瀏覽器支援 Web Audio API
- 檢查是否需要使用者互動才能啟動音訊
- 查看瀏覽器控制台錯誤訊息

### 問題 4：JWT Token 驗證失敗

**解決方案：**
- 確認 JWT secret 設定正確
- 檢查 token 是否正確儲存在 localStorage
- 確認 token 未過期

---

## 開發工具推薦

### VS Code 擴充套件（前端）
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag

### IntelliJ IDEA 插件（後端）
- Lombok
- Spring Assistant
- Database Navigator
- Rainbow Brackets

### 測試工具
- Postman（API 測試）
- MySQL Workbench（資料庫管理）
- Chrome DevTools（前端除錯）

---

## 下一步

環境設定完成後，可以開始實作功能：

1. **參考 [`architecture-plan.md`](plans/architecture-plan.md)** 了解整體架構
2. **參考 [`technical-specifications.md`](plans/technical-specifications.md)** 查看詳細程式碼範例
3. **按照待辦清單逐步實作功能**

建議從後端的使用者認證系統開始，然後實作前端的登入介面，最後再實作音樂創作的核心功能。

---

## 有用的命令參考

### 後端命令

```bash
# 編譯專案
mvn clean compile

# 執行測試
mvn test

# 打包專案
mvn clean package

# 執行應用程式
mvn spring-boot:run

# 跳過測試打包
mvn clean package -DskipTests
```

### 前端命令

```bash
# 安裝依賴
npm install

# 開發模式執行
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 安裝新套件
npm install package-name

# 移除套件
npm uninstall package-name
```

### Git 命令（版本控制）

```bash
# 初始化 Git
git init

# 添加所有檔案
git add .

# 提交變更
git commit -m "Initial commit"

# 建立 .gitignore
# 前端：node_modules/, dist/, .env
# 後端：target/, .mvn/, *.log
```

---

## 專案結構總覽

```
D:\MelodyGround\
├── melody-ground-frontend\     # React 前端專案
│   ├── node_modules\
│   ├── public\
│   ├── src\
│   ├── package.json
│   └── vite.config.js
│
├── melody-ground-backend\      # Spring Boot 後端專案
│   ├── src\
│   │   ├── main\
│   │   │   ├── java\
│   │   │   └── resources\
│   │   └── test\
│   ├── target\
│   └── pom.xml
│
└── plans\                      # 規劃文件
    ├── architecture-plan.md
    ├── technical-specifications.md
    └── quick-start-guide.md
```

---

祝你開發順利！如果遇到問題，可以參考規劃文件或查詢相關技術文件。
