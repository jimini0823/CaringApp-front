# API 사용 현황 상세 정리

## 📋 목차
1. [인증 관련](#인증-관련)
2. [홈 화면](#홈-화면)
3. [검색 화면](#검색-화면)
4. [기관 상세 화면](#기관-상세-화면)
5. [예약 화면](#예약-화면)
6. [상담 채팅 화면](#상담-채팅-화면)
7. [리뷰 작성 화면](#리뷰-작성-화면)
8. [마이페이지](#마이페이지)
9. [추천 화면](#추천-화면)
10. [회원가입 관련](#회원가입-관련)

---

## 인증 관련

### Login.js

#### `POST /auth/login` - 일반 로그인
- **함수**: `loginUser(payload)`
- **파일**: `app/api/auth/auth.api.js`
- **파라미터**:
  ```javascript
  {
    username: string,
    password: string
  }
  ```
- **응답**: 
  ```javascript
  {
    access_token: string,
    refresh_token: string,
    expires_in: number,
    refresh_token_expires_in: number
  }
  ```
- **인증 필요**: ❌

#### `POST /auth/oauth2/login/{provider}` - OAuth2 로그인
- **함수**: `loginOAuth2(provider, payload)`
- **파일**: `app/api/auth/auth.api.js`
- **파라미터**:
  - `provider`: `"naver"` | `"kakao"` | `"google"` (경로 파라미터)
  - Request Body:
    ```javascript
    {
      authorization_code: string,
      state: string
    }
    ```
- **응답**: 
  ```javascript
  {
    access_token: string,
    refresh_token: string
  }
  ```
- **인증 필요**: ❌
- **참고**: 현재 프론트엔드에서 임시로 홈 화면으로 이동하도록 구현됨

---

## 홈 화면

### Home.js

#### `GET /members/me/detail` - 내 회원 상세 조회
- **함수**: `getMyMemberDetail()`
- **파일**: `app/api/member/member.api.js`
- **응답**: 
  ```javascript
  {
    member: {
      id: number,
      name: string,
      phoneNumber: string,
      gender: string
    },
    elderlyProfiles: Array<{
      id: number,
      name: string,
      birthDate: string
    }>
  }
  ```
- **인증 필요**: ✅

#### `GET /advertisements/active/type/{type}` - 활성 광고 조회
- **함수**: `getActiveAdvertisementsByType(type)`
- **파일**: `app/api/advertisement/public.api.js`
- **파라미터**: `type = "MAIN_BANNER"`
- **응답**: 광고 배열
- **인증 필요**: ❌

---

## 검색 화면

### InstitutionResult.js

#### `GET /public/institutions` - 기관 목록 조회
- **함수**: `getInstitutionList(params)`
- **파일**: `app/api/institution/profile.api.js`
- **파라미터**:
  ```javascript
  {
    page: number,              // 기본값: 0
    size: number,              // 기본값: 20
    sort: string,               // 기본값: "name,asc"
    name: string,               // 기관명 검색 (선택)
    institutionType: string,   // DAY_CARE_CENTER | NURSING_HOME | HOME_CARE_SERVICE (선택)
    city: string,              // 시/도 (선택)
    maxMonthlyFee: number,     // 최대 월 이용료 (선택)
    isAdmissionAvailable: boolean, // 입소 가능 여부 (선택)
    latitude: number,          // 위도 (선택)
    longitude: number,         // 경도 (선택)
    radiusKm: number           // 반경 (km) (선택)
  }
  ```
- **응답**: 
  ```javascript
  {
    content: Array<{
      id: number,
      name: string,
      institutionType: string,
      address: {
        city: string,
        street: string
      },
      monthlyBaseFee: number,
      isAdmissionAvailable: boolean
    }>,
    last: boolean,
    totalElements: number
  }
  ```
- **인증 필요**: ❌

---

## 기관 상세 화면

### Institution.js

#### `GET /public/institutions/{institutionId}` - 기관 상세 조회
- **함수**: `getInstitutionDetail(institutionId)`
- **파일**: `app/api/institution/profile.api.js`
- **응답**: 기관 상세 정보 객체
- **인증 필요**: ❌

#### `GET /institutions/{institutionId}/counsels` - 상담 서비스 목록 조회
- **함수**: `getCounselList(institutionId)`
- **파일**: `app/api/institution/counsel.api.js`
- **응답**: 
  ```javascript
  Array<{
    id: number,
    title: string,
    description: string,
    isActive: boolean
  }>
  ```
- **인증 필요**: ❌
- **참고**: 상담 서비스가 없을 경우 프론트엔드에서 임시 더미 데이터 추가

#### `GET /institutions/{institutionId}/caregivers` - 요양보호사 목록 조회
- **함수**: `getCaregiverList(institutionId)`
- **파일**: `app/api/caregiver/caregiver.api.js`
- **응답**: 요양보호사 배열
- **인증 필요**: ❌

#### `GET /institutions/{institutionId}/reviews` - 기관 리뷰 목록 조회
- **함수**: `getInstitutionReviews(institutionId, page, size, sort)`
- **파일**: `app/api/institution/review.api.js`
- **파라미터**:
  - `page`: 0 (기본값)
  - `size`: 10 (기본값)
  - `sort`: "createdAt,desc" (기본값)
- **응답**: 
  ```javascript
  {
    content: Array<{
      id: number,
      member: { name: string },
      rating: number,
      content: string,
      tags: Array<{ id: number, name: string }>
    }>
  }
  ```
- **인증 필요**: ❌

#### `POST /chat/start` - 상담 시작
- **함수**: `startChat(payload)`
- **파일**: `app/api/chat/chat.api.js`
- **파라미터**:
  ```javascript
  {
    institutionId: number,
    counselId: number
  }
  ```
- **응답**: 
  ```javascript
  {
    chatRoomId: number
  }
  ```
- **인증 필요**: ✅

#### `POST /reviews/{reviewId}/report` - 리뷰 신고
- **함수**: `reportReview(reviewId, payload)`
- **파일**: `app/api/review/review.api.js`
- **파라미터**:
  ```javascript
  {
    reportReason: string,  // 예: "SPAM"
    description: string
  }
  ```
- **인증 필요**: ✅

---

## 예약 화면

### Reservation.js

#### `GET /public/institutions` - 기관 목록 조회
- **함수**: `getInstitutionList({ page: 0, size: 1 })`
- **파일**: `app/api/institution/profile.api.js`
- **용도**: institutionId가 없을 때 첫 번째 기관 자동 선택
- **인증 필요**: ❌

#### `GET /institutions/{institutionId}/counsels` - 상담 서비스 목록 조회
- **함수**: `getCounselList(institutionId)`
- **파일**: `app/api/institution/counsel.api.js`
- **응답**: 상담 서비스 배열
- **인증 필요**: ❌

#### `GET /institutions/{institutionId}/counsels/{counselId}?date={date}` - 예약 가능 시간 조회
- **함수**: `getCounselAvailableTimes(institutionId, counselId, date)`
- **파일**: `app/api/institution/counsel.api.js`
- **파라미터**: 
  - `date`: `yyyy-MM-dd` 형식 (쿼리 파라미터)
- **응답**: 
  ```javascript
  {
    timeSlots: Array<{
      slotIndex: number,
      startTime: string,  // HH:mm
      endTime: string,    // HH:mm
      isAvailable: boolean
    }>
  }
  ```
- **인증 필요**: ❌

#### `GET /me/elderly-profiles` - 내 어르신 프로필 목록 조회
- **함수**: `getMyElderlyProfiles()`
- **파일**: `app/api/elderly/elderly.api.js`
- **응답**: 
  ```javascript
  {
    profiles: Array<{
      id: number,
      name: string,
      birthDate: string,
      gender: string
    }>,
    totalCount: number
  }
  ```
- **인증 필요**: ✅

#### `POST /members/reservations` - 회원 예약 생성
- **함수**: `createMemberReservation(payload)`
- **파일**: `app/api/member/reservation.api.js`
- **파라미터**:
  ```javascript
  {
    counselId: number,
    reservationDate: string,      // yyyy-MM-dd
    slotIndex: number,
    startTime: string,             // HH:mm
    endTime: string,               // HH:mm
    elderlyProfileId: number
  }
  ```
- **인증 필요**: ✅

---

## 상담 채팅 화면

### CounselChat.js

#### `GET /chat/rooms/{chatRoomId}/member` - 채팅방 정보 조회
- **함수**: `getChatRoomInfoAsMember(chatRoomId)`
- **파일**: `app/api/chat/chat.api.js`
- **응답**: 채팅방 정보 객체
- **인증 필요**: ✅

#### `GET /chat/rooms/{chatRoomId}/messages/member` - 메시지 목록 조회
- **함수**: `getMessagesAsMember(chatRoomId, { page, size, sort })`
- **파일**: `app/api/chat/chat.api.js`
- **파라미터**:
  ```javascript
  {
    page: number,      // 기본값: 0
    size: number,      // 기본값: 20
    sort: string[]     // 기본값: ["createdAt,desc"]
  }
  ```
- **응답**: 
  ```javascript
  {
    messages: Array<{
      id: number,
      content: string,
      createdAt: string,
      senderType: string
    }>
  }
  ```
- **인증 필요**: ✅

#### `POST /chat/rooms/{chatRoomId}/messages/member` - 메시지 전송
- **함수**: `sendMessageAsMember(chatRoomId, payload)`
- **파일**: `app/api/chat/chat.api.js`
- **파라미터**:
  ```javascript
  {
    content: string
  }
  ```
- **인증 필요**: ✅

#### `GET /chat/rooms/{chatRoomId}/messages/poll/member?lastMessageId={id}` - 메시지 폴링
- **함수**: `pollMessagesAsMember(chatRoomId, lastMessageId)`
- **파일**: `app/api/chat/chat.api.js`
- **파라미터**: `lastMessageId` (쿼리 파라미터)
- **용도**: 5초마다 새 메시지 확인
- **인증 필요**: ✅

#### `DELETE /chat/rooms/{chatRoomId}/messages/{messageId}/member` - 메시지 삭제
- **함수**: `deleteMessageAsMember(chatRoomId, messageId)`
- **파일**: `app/api/chat/chat.api.js`
- **인증 필요**: ✅

#### `POST /chat/rooms/{chatRoomId}/close/member` - 채팅 종료
- **함수**: `closeChatAsMember(chatRoomId)`
- **파일**: `app/api/chat/chat.api.js`
- **인증 필요**: ✅

### Counsel.js

#### `GET /members/me/consult-requests` - 내 상담 요청 목록 조회
- **함수**: `getMyConsultRequests({ status, page, size, sort })`
- **파일**: `app/api/chat/chat.api.js`
- **파라미터**:
  ```javascript
  {
    status: string,              // 선택
    page: number,                 // 기본값: 0
    size: number,                 // 기본값: 20
    sort: string[]                // 기본값: ["createdAt,desc"]
  }
  ```
- **응답**: 
  ```javascript
  {
    consultRequests: Array<{
      id: number,
      chatRoomId: number,
      institution: {
        name: string,
        imageUrl: string
      },
      lastMessageContent: string,
      lastMessageAt: string,
      unreadCount: number,
      status: string
    }>
  }
  ```
- **인증 필요**: ✅

---

## 리뷰 작성 화면

### ReviewWrite.js

#### `GET /tags/category/{category}` - 태그 목록 조회
- **함수**: `getTagsByCategory(category)`
- **파일**: `app/api/tag/tag.api.js`
- **파라미터**: `category = "REVIEW"`
- **응답**: 
  ```javascript
  {
    tags: Array<{
      id: number,
      name: string,
      category: string
    }>
  }
  ```
- **인증 필요**: ❌

#### `GET /reviews/{reviewId}` - 리뷰 상세 조회
- **함수**: `getReviewDetail(reviewId)`
- **파일**: `app/api/review/review.api.js`
- **응답**: 리뷰 상세 정보 객체
- **인증 필요**: ❌

#### `POST /reviews` - 리뷰 작성
- **함수**: `createReview(payload)`
- **파일**: `app/api/review/review.api.js`
- **파라미터**:
  ```javascript
  {
    reservationId: number,
    rating: number,        // 1-5
    content: string,
    tagIds: number[]
  }
  ```
- **인증 필요**: ✅

#### `PUT /reviews/{reviewId}` - 리뷰 수정
- **함수**: `updateReview(reviewId, payload)`
- **파일**: `app/api/review/review.api.js`
- **파라미터**: 작성과 동일
- **인증 필요**: ✅

---

## 마이페이지

### Mypage.js

#### `GET /members/me/mypage` - 마이페이지 조회
- **함수**: `getMyPage()`
- **파일**: `app/api/member/member.api.js`
- **응답**: 마이페이지 정보 객체
- **인증 필요**: ✅

#### `GET /members/me/statistics` - 내 활동 통계 조회
- **함수**: `getMyStatistics()`
- **파일**: `app/api/member/member.api.js`
- **응답**: 
  ```javascript
  {
    totalReservations: number,
    totalReviews: number,
    totalElderlyProfiles: number
  }
  ```
- **인증 필요**: ✅

#### `GET /members/me/preference-tags` - 내 선호 태그 조회
- **함수**: `getPreferenceTags()`
- **파일**: `app/api/member/member.api.js`
- **응답**: 
  ```javascript
  {
    tags: Array<{
      id: number,
      name: string
    }>
  }
  ```
- **인증 필요**: ✅

#### `GET /members/me/reviews` - 내가 작성한 리뷰 목록 조회
- **함수**: `getMyReviews(page, size, sort)`
- **파일**: `app/api/review/review.api.js`
- **파라미터**:
  - `page`: 0 (기본값)
  - `size`: 10 (기본값)
  - `sort`: "createdAt,desc" (기본값)
- **응답**: 
  ```javascript
  {
    content: Array<{
      id: number,
      rating: number,
      content: string,
      createdAt: string
    }>
  }
  ```
- **인증 필요**: ✅

#### `DELETE /reviews/{reviewId}` - 리뷰 삭제
- **함수**: `deleteReview(reviewId)`
- **파일**: `app/api/review/review.api.js`
- **인증 필요**: ✅

---

## 추천 화면

### RecommendStart.js

#### `GET /members/me/elderly-profiles` - 내 어르신 프로필 목록 조회
- **함수**: `getMyElderlyProfiles()`
- **파일**: `app/api/elderly/elderly.api.js`
- **응답**: 
  ```javascript
  {
    profiles: Array<{
      id: number,
      name: string
    }>,
    totalCount: number
  }
  ```
- **인증 필요**: ✅
- **참고**: 프로필이 없을 경우 임시 프로필 자동 생성

#### `POST /members/me/recommendations` - 기관 추천
- **함수**: `getRecommendations(payload)`
- **파일**: `app/api/recommendation/recommendation.api.js`
- **파라미터**:
  ```javascript
  {
    elderlyProfileId: number,
    additionalText: string
  }
  ```
- **응답**: 
  ```javascript
  {
    data: {
      institutions: Array<{
        institutionId: number,
        name: string,
        type: string,
        address: string,
        isAvailable: boolean,
        tags: string[],
        recommendationReason: string
      }>,
      totalCount: number
    }
  }
  ```
- **인증 필요**: ✅

---

## 회원가입 관련

### SelfIdentification.js

#### `POST /auth/certification-code` - 개인 인증 코드 발송
- **함수**: `sendCertificationCode(payload)`
- **파일**: `app/api/auth/auth.api.js`
- **파라미터**:
  ```javascript
  {
    phone: string
  }
  ```
- **인증 필요**: ❌

### IdentificationNumber.js

#### `POST /auth/verify-phone` - 전화번호 인증 + 코드 검증
- **함수**: `verifyUserPhone(payload)`
- **파일**: `app/api/auth/auth.api.js`
- **파라미터**:
  ```javascript
  {
    phone: string,
    certificationCode: string
  }
  ```
- **응답**: 인증 토큰
- **인증 필요**: ❌

### IDPW.js

#### `POST /auth/register` - 일반 회원가입
- **함수**: `registerUser(payload, token)`
- **파일**: `app/api/auth/auth.api.js`
- **파라미터**:
  ```javascript
  {
    username: string,
    password: string,
    gender: string,
    address: {
      city: string,
      street: string,
      zipCode: string
    }
  }
  ```
- **헤더**: `Authorization: Bearer {token}` (인증 토큰 필요)
- **인증 필요**: ❌ (하지만 헤더에 토큰 필요)

### Welcome.js

#### `POST /members/me/elderly-profiles` - 어르신 프로필 생성
- **함수**: `createElderlyProfile(payload)`
- **파일**: `app/api/elderly/elderly.api.js`
- **파라미터**:
  ```javascript
  {
    name: string,
    gender: string,              // MALE | FEMALE | NOT_KNOWN
    birthDate: string,            // yyyy-MM-dd
    bloodType: string,           // A | B | O | AB | UNKNOWN
    phoneNumber: string,
    activityLevel: string,       // HIGH | MEDIUM | LOW
    cognitiveLevel: string,      // NORMAL | MODERATE | SEVERE
    longTermCareGrade: string,   // NONE | GRADE_1 ~ GRADE_5
    notes: string,
    address: {
      zipCode: string,
      city: string,
      street: string
    }
  }
  ```
- **주의**: `longTermCareGrade`가 있으면 `activityLevel`과 `cognitiveLevel`을 보낼 수 없음
- **인증 필요**: ✅

---

## 📝 참고사항

### Base URL
- `http://43.203.41.246:8080/api/v1`

### 인증
- 대부분의 API는 Bearer Token 인증이 필요합니다
- 토큰은 `Authorization: Bearer {access_token}` 헤더로 전송됩니다
- 인증이 필요 없는 API:
  - `/auth/login`
  - `/auth/register`
  - `/auth/certification-code`
  - `/auth/verify-phone`
  - `/auth/token/refresh`
  - `/institutions/profile`
  - `/institutions/{id}/counsels`
  - `/advertisements/active`

### 데이터 형식
- **날짜**: `yyyy-MM-dd` 형식 (예: `2024-01-15`)
- **시간**: `HH:mm` 형식 (예: `14:30`)
- **페이지네이션**: 
  - `page`: 0부터 시작
  - `size`: 페이지 크기
  - `sort`: 정렬 기준 (예: `"createdAt,desc"`)

### 응답 구조
- 대부분의 API는 다음 구조로 응답합니다:
  ```javascript
  {
    success: boolean,
    code: string,
    message: string,
    data: {
      // 실제 데이터
    }
  }
  ```
- 일부 API는 중첩 구조를 가집니다:
  ```javascript
  {
    data: {
      data: {
        // 실제 데이터
      }
    }
  }
  ```

### 에러 처리
- 모든 API 호출은 try-catch로 감싸져 있습니다
- 에러 발생 시 Alert로 사용자에게 알립니다
- 401 Unauthorized 에러 시 자동으로 로그인 화면으로 이동합니다

### 특수 처리
- **상담 서비스**: 목록이 비어있을 경우 프론트엔드에서 임시 더미 데이터 추가
- **어르신 프로필**: 추천 화면에서 프로필이 없을 경우 임시 프로필 자동 생성
