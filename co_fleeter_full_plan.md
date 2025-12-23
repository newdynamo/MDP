# 📘 **Co-Fleeter 플랫폼 통합 개발계획서 (AI 개발자용 / MD 버전)**
**Version 1.0 — Combined Specification**

---

# 0. 개요 (Overview)

본 문서는 다음 두 가지 자료를 완전 통합하여 **AI 개발자와 실제 개발자가 혼동 없이 구현할 수 있도록 작성된 기술 사양서**이다.

1. **Co-Fleeter 서비스 기반 IR 내용**
2. **co-fleeter.com 초기 모델 분석 내용**
3. **추가적으로 반영해야 하는 누락 기능(회원/인증/권한 등)**

문서의 목적은 다음과 같다.

- 플랫폼의 요구사항을 정형화하고
- 기능/비기능/아키텍처/데이터 모델을 명확히 정의하며
- AI 기반 코드 자동생성 시 오류가 없도록 상세한 조건을 제공하고
- 개발자·PM·디자이너·DevOps가 동일한 이해를 갖도록 한다.

---

# 1. 서비스 목적 및 비전

**Co-Fleeter는 해운업의 탈탄소 전환을 지원하는 End-to-End SaaS 플랫폼**으로서 다음을 목표로 한다.

- EU-ETS, FuelEU Maritime, IMO 규제 대응 자동화
- 선박별·선사별 탄소배출 계산, 예측, 보고 자동화
- Surplus/Deficit 기반 Pooling·Trading Marketplace 구축
- 선급/Verifier와 연결되는 공식 보고 체계 제공
- 해운 탈탄소 운영을 위한 핵심 데이터 플랫폼 역할 수행
- CII 및 GHGIE 등 규제 계산기 Public Widget으로 시장 유입 확대
- 운영사·화주·금융·조선·연료공급사 등 “해운 생태계 전반”을 연결

---

# 2. 핵심 기능 목록 (기능 요구사항)

## 2.1 필수 기능 (MVP / Phase 1)
### A. 사용자·조직 관리 (Auth/Org)
- 회원가입 (이메일 인증)
- 조직 생성·관리 (회사명, 지역, 연락담당자)
- 사용자 초대/삭제
- 역할(Role) 기반 권한 관리(RBAC)
  - ORG_ADMIN / ORG_USER / ANALYST / VERIFIER / AUDITOR
- 로그인 (JWT / Refresh)
- 비밀번호 재설정
- MFA 옵션

### B. 선박 자산 관리 (Fleet/Assets)
- 선박 등록(IMO, 선명, GT, DWT, 엔진타입, 연료타입)
- 선박별 연료 데이터·운항 데이터 연결
- 선박 상태 대시보드(CII, CO2, 연료 트렌드)

### C. 데이터 수집(ingest) 모듈
- CSV/Excel 업로드 + 템플릿 제공
- SFTP 업로드(스케줄링)
- API 수집 엔드포인트
- 데이터 유효성 검사(누락, 음수, 타임스탬프 오류)
- 데이터 품질 로그

### D. 계산 엔진(Calculation Engine)
- EU-ETS CO2 계산
- FuelEU Maritime intensity & Surplus/Deficit 계산
- IMO DCS/CII 계산
- 규칙 엔진(계산 규칙 JSON/YAML 외부화)
- 각 계산마다 버전 관리(calc_profile)
- 입력 데이터 해시 저장(감사 추적)

### E. 리포트
- Verifier 제출용 PDF
- 선사/화주용 Summary 리포트
- 연간 CO2, 비용 예측, 규제별 Penalty 예측

### F. Pooling / Matching / Trading (기본)
- Pool 생성
- 참여 신청 / 승인
- Surplus/Deficit 자동 계산
- 매칭 제안 규칙 생성(기본)
- 내부 거래 주문서 생성
- 거래 이력 관리

### G. 대시보드
- 선박/조직 CO2, CII, 연료소모, 비용 예측
- 규제별 리스크 알림
- Pooling 상태

---

## 2.2 확장 기능 (Phase 2~3)
- 실시간 데이터 스트리밍
- 고급 시뮬레이터: 연료전환 시나리오(LCA 포함)
- AI 기반 최적항로/최적연료 추천
- Marketplace 확장(EUA/FuelEU Surplus 거래소)
- Verifier/선급 API 연동
- 다국어 지원

---

# 3. co-fleeter.com 초기 모델 반영 요소

## 3.1 Public Calculator(예: CII 계산기)
- 홈페이지 노출된 CII 계산기 기능을 기반으로  
**“Public Widget + Private API”** 구조로 설계
- Public Widget은 간단 입력 → 즉시 계산 → Demo 신청 유도
- Private API는 실제 고객 데이터 기반 정확계산 제공
- 각 계산 결과에 “적용 규칙 버전 표시” 필수

## 3.2 데모 자동화 파이프라인
- 사용자가 계산기를 사용 → Contact/Lead 생성 →  
자동으로 샘플 PDF 리포트 생성 → Sales 팀 Slack/Webhook 알림

## 3.3 Regulation Hub 추가
- FuelEU / EU-ETS / IMO 규정 요약
- 마지막 업데이트 날짜 + 적용 규칙 버전 표시
- 규제 변경 시 규칙 엔진 파일 버전 자동 반영

## 3.4 공개 API 보안 강화
- Public API: Rate-limit, CAPTCHA, API Key 필요
- Private API: JWT + 조직 권한 기반 RBAC
- Abuse 방지를 위해 로그 분리 저장

---

# 4. 비기능 요구사항 (Non-functional Requirements)

## 4.1 성능
- 최소 1,000척 규모 데이터 처리
- 동시 사용자 200명
- CSV 10,000줄 업로드 → 60초 내 ingestion

## 4.2 보안
- TLS 1.2+
- DB 저장 시 민감데이터 암호화
- OWASP Top 10 방어
- RBAC
- JWT + Refresh Token Rotation

## 4.3 감사·추적 가능성
- 모든 계산은 다음 정보를 함께 저장:
  - 규칙 버전
  - 입력 데이터 해시
  - 로직 버전
  - 시간/사용자/요청 ID
- 모든 리포트는 생성 시점·규칙 버전 기록

---

# 5. 시스템 아키텍처 설계

```
[Architecture Diagram omitted for brevity; same as previous message]
```

---

# 6. 데이터 모델 (주요 테이블)

(omitted for brevity; same structure as previous response)

---

# 7. API 구조 (간략)

(omitted for brevity)

---

# 8. 계산 엔진 설계

(omitted for brevity)

---

# 9. QA / 테스트

(omitted for brevity)

---

# 10. 개발 일정 (6개월)

(omitted for brevity)

---

# 11. 예산 추정 (MVP, 6개월)

(omitted for brevity)

---

# 12. 개발자가 바로 쓸 산출물 목록

(omitted)
