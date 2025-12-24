# MelodyGround 技術規格文件

## 前端技術規格

### 1. 專案初始化

```bash
# 建立 Vite + React 專案
npm create vite@latest melody-ground-frontend -- --template react
cd melody-ground-frontend
npm install

# 安裝必要依賴
npm install react-router-dom axios tone midi-writer-js
npm install -D tailwindcss postcss autoprefixer
```

### 2. 核心依賴說明

| 套件名稱 | 版本 | 用途 |
|---------|------|------|
| react | ^18.2.0 | UI 框架 |
| react-router-dom | ^6.20.0 | 路由管理 |
| axios | ^1.6.0 | HTTP 請求 |
| tone | ^14.7.77 | 音訊處理和合成 |
| midi-writer-js | ^2.1.4 | MIDI 檔案生成 |
| tailwindcss | ^3.3.0 | CSS 框架 |

### 3. 虛擬鍵盤元件規格

#### 元件結構
```javascript
// components/Keyboard/VirtualKeyboard.jsx
const VirtualKeyboard = ({ 
  instrument, 
  octave, 
  onNotePlay, 
  isRecording 
}) => {
  // 鍵盤配置
  const keyboardLayout = {
    row1: ['Q','W','E','R','T','Y','U','I','O','P'],
    row2: ['A','S','D','F','G','H','J','K','L'],
    row3: ['Z','X','C','V','B','N','M']
  };
  
  // 音符映射
  const noteMapping = {
    row1: ['C','D','E','F','G','A','B','C','D','E'],
    row2: ['C','D','E','F','G','A','B','C','D'],
    row3: ['C','D','E','F','G','A','B']
  };
  
  // 處理按鍵事件
  // 觸發音效
  // 記錄音符（如果正在錄製）
}
```

#### 鍵盤按鍵對應表

| 鍵盤按鍵 | 音符（中音域） | 音符（高音域） | 音符（低音域） |
|---------|--------------|--------------|--------------|
| Q | C4 | C5 | C3 |
| W | D4 | D5 | D3 |
| E | E4 | E5 | E3 |
| R | F4 | F5 | F3 |
| T | G4 | G5 | G3 |
| Y | A4 | A5 | A3 |
| U | B4 | B5 | B3 |
| I | C5 | C6 | C4 |
| O | D5 | D6 | D4 |
| P | E5 | E6 | E4 |

### 4. 音訊服務規格

```javascript
// services/audioService.js
import * as Tone from 'tone';

class AudioService {
  constructor() {
    this.instruments = {
      piano: new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination(),
      
      synth: new Tone.PolySynth(Tone.Synth).toDestination(),
      
      // 其他樂器...
    };
    
    this.currentInstrument = 'piano';
  }
  
  playNote(note, duration = '8n') {
    const instrument = this.instruments[this.currentInstrument];
    instrument.triggerAttackRelease(note, duration);
  }
  
  setInstrument(instrumentName) {
    this.currentInstrument = instrumentName;
  }
  
  async initialize() {
    await Tone.start();
  }
}

export default new AudioService();
```

### 5. 錄製服務規格

```javascript
// services/recordingService.js
class RecordingService {
  constructor() {
    this.isRecording = false;
    this.startTime = null;
    this.notes = [];
  }
  
  startRecording() {
    this.isRecording = true;
    this.startTime = Date.now();
    this.notes = [];
  }
  
  recordNote(note, instrument, duration) {
    if (!this.isRecording) return;
    
    const timestamp = Date.now() - this.startTime;
    this.notes.push({
      timestamp,
      note,
      instrument,
      duration,
      velocity: 100
    });
  }
  
  stopRecording() {
    this.isRecording = false;
    return {
      notes: this.notes,
      duration: Date.now() - this.startTime
    };
  }
  
  playRecording(recording, audioService) {
    recording.notes.forEach(noteData => {
      setTimeout(() => {
        audioService.playNote(noteData.note, noteData.duration);
      }, noteData.timestamp);
    });
  }
}

export default new RecordingService();
```

### 6. MIDI 匯出規格

```javascript
// utils/midiExporter.js
import MidiWriter from 'midi-writer-js';

export const exportToMidi = (recording, tempo = 120) => {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  
  // 將錄製的音符轉換為 MIDI 事件
  recording.notes.forEach(note => {
    const midiNote = convertToMidiNote(note.note);
    const duration = calculateMidiDuration(note.duration);
    
    track.addEvent(new MidiWriter.NoteEvent({
      pitch: [midiNote],
      duration: duration,
      velocity: note.velocity,
      startTick: Math.floor(note.timestamp / 10)
    }));
  });
  
  const write = new MidiWriter.Writer(track);
  return write.buildFile();
};

const convertToMidiNote = (noteName) => {
  // 將音符名稱（如 'C4'）轉換為 MIDI 音符編號
  const noteMap = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3,
    'E': 4, 'F': 5, 'F#': 6, 'G': 7,
    'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  
  const note = noteName.slice(0, -1);
  const octave = parseInt(noteName.slice(-1));
  
  return (octave + 1) * 12 + noteMap[note];
};
```

### 7. 音訊錄製與匯出規格

```javascript
// utils/audioRecorder.js
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
  
  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: true 
    });
    
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
    
    this.mediaRecorder.start();
  }
  
  stopRecording() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: 'audio/wav' 
        });
        resolve(audioBlob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  downloadAudio(audioBlob, filename) {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default new AudioRecorder();
```

### 8. API 服務規格

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器：添加 JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 回應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// services/compositionService.js
import api from './api';

export const compositionService = {
  // 取得所有作品
  getAllCompositions: async () => {
    const response = await api.get('/compositions');
    return response.data;
  },
  
  // 取得單一作品
  getComposition: async (id) => {
    const response = await api.get(`/compositions/${id}`);
    return response.data;
  },
  
  // 建立作品
  createComposition: async (compositionData) => {
    const response = await api.post('/compositions', compositionData);
    return response.data;
  },
  
  // 更新作品
  updateComposition: async (id, compositionData) => {
    const response = await api.put(`/compositions/${id}`, compositionData);
    return response.data;
  },
  
  // 刪除作品
  deleteComposition: async (id) => {
    await api.delete(`/compositions/${id}`);
  },
  
  // 匯出 MIDI
  exportMidi: async (id) => {
    const response = await api.get(`/compositions/${id}/export/midi`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
```

---

## 後端技術規格

### 1. 專案初始化

使用 Spring Initializr 建立專案，選擇以下依賴：
- Spring Web
- Spring Security
- Spring Data JPA
- MySQL Driver
- Lombok
- Validation

### 2. Maven 依賴配置

```xml
<!-- pom.xml 關鍵依賴 -->
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    
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
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### 3. 資料庫配置

```properties
# application.properties
spring.application.name=melody-ground-backend

# 資料庫配置
spring.datasource.url=jdbc:mysql://localhost:3306/melodyground?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Taipei
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT 配置
jwt.secret=your-secret-key-here-make-it-long-and-secure
jwt.expiration=86400000

# 伺服器配置
server.port=8080

# CORS 配置
cors.allowed-origins=http://localhost:5173
```

### 4. 實體類別規格

```java
// model/User.java
package com.melodyground.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Composition> compositions;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

```java
// model/Composition.java
package com.melodyground.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "compositions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Composition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Integer tempo = 120;
    
    @OneToMany(mappedBy = "composition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NoteSequence> noteSequences;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

```java
// model/NoteSequence.java
package com.melodyground.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "note_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteSequence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "composition_id", nullable = false)
    private Composition composition;
    
    @Column(nullable = false)
    private Long timestamp;
    
    @Column(nullable = false, length = 10)
    private String note;
    
    @Column(nullable = false, length = 50)
    private String instrument;
    
    @Column(nullable = false)
    private Integer duration;
    
    @Column(nullable = false)
    private Integer velocity = 100;
}
```

### 5. DTO 規格

```java
// dto/LoginRequest.java
package com.melodyground.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "使用者名稱不能為空")
    private String username;
    
    @NotBlank(message = "密碼不能為空")
    private String password;
}
```

```java
// dto/RegisterRequest.java
package com.melodyground.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "使用者名稱不能為空")
    @Size(min = 3, max = 50, message = "使用者名稱長度必須在 3-50 之間")
    private String username;
    
    @NotBlank(message = "電子郵件不能為空")
    @Email(message = "電子郵件格式不正確")
    private String email;
    
    @NotBlank(message = "密碼不能為空")
    @Size(min = 6, message = "密碼長度至少為 6")
    private String password;
}
```

```java
// dto/CompositionRequest.java
package com.melodyground.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CompositionRequest {
    @NotBlank(message = "作品標題不能為空")
    private String title;
    
    private String description;
    
    @NotNull(message = "速度不能為空")
    private Integer tempo;
    
    @NotNull(message = "音符序列不能為空")
    private List<NoteSequenceDto> notes;
}
```

```java
// dto/NoteSequenceDto.java
package com.melodyground.dto;

import lombok.Data;

@Data
public class NoteSequenceDto {
    private Long timestamp;
    private String note;
    private String instrument;
    private Integer duration;
    private Integer velocity;
}
```

### 6. JWT 配置規格

```java
// security/JwtTokenProvider.java
package com.melodyground.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 7. Security 配置規格

```java
// config/SecurityConfig.java
package com.melodyground.config;

import com.melodyground.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### 8. Controller 規格

```java
// controller/AuthController.java
package com.melodyground.controller;

import com.melodyground.dto.*;
import com.melodyground.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
```

```java
// controller/CompositionController.java
package com.melodyground.controller;

import com.melodyground.dto.CompositionRequest;
import com.melodyground.service.CompositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compositions")
@RequiredArgsConstructor
public class CompositionController {
    
    private final CompositionService compositionService;
    
    @GetMapping
    public ResponseEntity<?> getAllCompositions() {
        return ResponseEntity.ok(compositionService.getAllCompositions());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getComposition(@PathVariable Long id) {
        return ResponseEntity.ok(compositionService.getComposition(id));
    }
    
    @PostMapping
    public ResponseEntity<?> createComposition(
            @Valid @RequestBody CompositionRequest request) {
        return ResponseEntity.ok(compositionService.createComposition(request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComposition(
            @PathVariable Long id,
            @Valid @RequestBody CompositionRequest request) {
        return ResponseEntity.ok(
            compositionService.updateComposition(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComposition(@PathVariable Long id) {
        compositionService.deleteComposition(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/export/midi")
    public ResponseEntity<?> exportMidi(@PathVariable Long id) {
        return compositionService.exportToMidi(id);
    }
}
```

---

## 開發流程建議

### 階段一：環境設定
1. 安裝 Node.js、JDK、MySQL
2. 建立前後端專案
3. 設定資料庫連線
4. 測試基本連線

### 階段二：後端開發
1. 實作使用者認證（註冊、登入）
2. 實作 JWT 驗證
3. 實作音樂作品 CRUD API
4. 測試 API 端點

### 階段三：前端開發
1. 建立路由和頁面結構
2. 實作登入註冊介面
3. 實作虛擬鍵盤
4. 整合音訊播放
5. 實作錄製功能

### 階段四：整合與測試
1. 前後端整合
2. 測試完整流程
3. 錯誤處理
4. 效能優化

---

## 測試建議

### 前端測試
- 測試不同瀏覽器的音訊相容性
- 測試鍵盤事件處理
- 測試 API 呼叫和錯誤處理

### 後端測試
- 單元測試（Service 層）
- 整合測試（Controller 層）
- API 端點測試（Postman）

### 整合測試
- 完整的使用者流程測試
- 音樂錄製和播放測試
- 檔案匯出測試

---

## 部署建議

### 前端部署
- 使用 Vercel、Netlify 或 GitHub Pages
- 設定環境變數（API URL）
- 建置優化（`npm run build`）

### 後端部署
- 使用 Heroku、Railway 或 AWS
- 設定環境變數（資料庫、JWT secret）
- 使用 Docker 容器化

### 資料庫部署
- 使用雲端資料庫服務（AWS RDS、Azure Database）
- 定期備份
- 設定連線池

---

這份技術規格文件提供了實作所需的詳細程式碼範例和配置。開發時可以參考這些規格，確保各個元件按照統一的標準實作。
