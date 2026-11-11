# 레퍼런스 사이트 메뉴 분석 (packetgo.com / pribit.com)

분석일: 2026-11-03 · 방법: 실제 페이지 HTML에서 nav/footer 링크, 제목 구조(h1~h4), 폼 필드 추출

두 사이트는 **같은 회사(프라이빗에이아이 / PRIBIT AI)** 가 운영한다.
- **packetgo.com** = 제품 마케팅 사이트 (리드 확보 중심, SaaS형)
- **pribit.com** = 기업(코퍼레이트) 사이트 (회사·기술·뉴스 중심, 구형 게시판 CMS)

---

## 1. packetgo.com

### 1-1. 사이트맵

| 구분 | 메뉴 | URL | 페이지 성격 |
|---|---|---|---|
| 헤더 | (로고) | `/` | 홈 |
| 헤더 | AI OS | `/ai-os` | 제품 상세 |
| 헤더 | ZTNA | `/ztna` | 제품 상세 |
| 헤더 | RISKi | `/riski` | 제품 상세 |
| 헤더 | 리소스 ▾ (드롭다운) | `/resources` → **403**, 자체 페이지 없음 | 그룹 라벨 |
| ↳ | 릴리즈노트 | `/resources/release-notes` | 목록 + 검색 |
| ↳ | 자료실 | `/resources/library` | 다운로드 / 영상 |
| ↳ | 용어집 | `/resources/glossary` | 가나다·ABC 인덱스 |
| 헤더 | 파트너 | `/partners` | 프로그램 소개 |
| 헤더 | 문의하기 | `/contact` | 폼 |
| 헤더 CTA | 접속하기 / Get Started | `/connect` | 서비스 진입 선택 |
| 푸터/모바일 전용 | **N2SF** | `/n2sf` | 솔루션 랜딩 (**데스크톱 헤더에는 없음**) |
| 푸터 | 개인정보처리방침 | `/legal/privacy` | 법적 고지 (11개 조) |
| 푸터 | 이용약관 | `/legal/terms` | 법적 고지 (19개 조 + 부칙) |

푸터: 회사명·주소(서울 마포구 양화로8길 32-16)·전화 02-859-2560·sales@pribit.com·SNS(네이버 블로그/LinkedIn/YouTube/메일)·© PRIBIT AI.
모든 페이지 공통 마지막 블록: **PacketGo / 리소스 / 파트너 / 문의하기 / 접속하기** (푸터 직전 CTA 영역).

### 1-2. 페이지별 구성

**홈 `/`**
1. 히어로 "Driven by AI, Governed by You"
2. 문제 제기 — "AI 시대의 경쟁력은 더 좋은 모델보다 더 나은 운영에서"
3. 제품 3종 카드 (PacketGo OS / ZTNA / RISKi) — "연결과 통제, 인사이트를 하나의 플랫폼으로"
4. 가치 4가지 (흩어진 연결→하나의 흐름 / 디바이스 즉시 차단 / 무엇을 확인하는 보안 / 작은 틈새)
5. 산업별 5종: 금융·공공기관·의료·제조·통신
6. 기능 6종: 원격접속 제어·통합 로그인·신종 위험 차단·간편 권한 설정·통합 로그 관리·실시간 상태 확인
7. 마무리 CTA

**AI OS `/ai-os`** — H1 "단 하나의 AI 운영체제"
- 주요 기능 4: 하나의 아이덴티티 / 필요한 데이터만 필요한 순간에 / 허락된 범위 내 실행 / AI 판단 추적
- 대비 섹션 "AI를 사용하는 기업 vs AI가 일하는 기업"
- 도입·운영 장점 6: 도입 부담↓, 운영 부담↓, 업무 전환 속도, 유연한 확장, 기준 하나, 규제 대응
- 운영 사이클 7단계: 연결→통제→실행→승인·감사→평가·학습→최적화→적용
- N2SF with PacketGo → 최종 CTA

**ZTNA `/ztna`** — H1 "가장 쉬운 ZTNA 솔루션" (가장 긴 페이지)
- 주요 기능 4 / 제로트러스트 네트워크 설명
- 아키텍처 3: SDP · 마이크로세그멘테이션 · EIG(강화된 인증)
- 모두를 위한 ZTNA 6: 모든 디바이스, MFA, 내부망 정밀 제어, 민감 데이터 유출 방지, 빠른 연결, 클라우드·온프레미스 통합
- **핵심 수치** · 고객사 로고("앞서가는 선택") · 산업 환경별 연결 · 보안 인증/표준 · CTA

**RISKi `/riski`** — H1 "쏟아지는 수천 개의 위험, 단 하나의 위협까지"
- 기능 5: 공격 흐름 연결 / AI 스코어링 / 실시간 방어 / 로그 리플레이 / 트래픽→인사이트
- 운영 효과 → CTA

**N2SF `/n2sf`** — H1 "분리의 시대에서 연결의 시대로"
- 전환이 막막한 이유 → 단계별 접근(+가이드라인 상담 CTA) → 통합 아이덴티티 → 핵심 가치 → 실증사업 사례 → CTA

**릴리즈노트 `/resources/release-notes`** — 검색창 + 날짜/유형 배지(중요·새로운 기능·버그·핫픽스) 리스트. 현재 5건 (2026.08.22~08.31)

**자료실 `/resources/library`** — 다운로드 카드 4건(소개서·영문 소개서·기술소개·회사소개) + 영상 재생 모달

**용어집 `/resources/glossary`** — 영문 A~Z(A,B,C,D,E,I,J,L,M,N,P,R,S,Z) + 한글 ㄱ~ㅎ 인덱스, 하단 인사이트 CTA

**파트너 `/partners`**
1. 행사 소식 슬라이드(PRIBIT AI Tech Summit, 2025 파트너 데이 — 60여 개 파트너사 100여 명 참석)
2. 혜택 4: 전문 기술 지원·글로벌 네트워크·공동 마케팅·교육
3. 파트너십 절차 5단계: 신청→검토·상담→계약→온보딩→협력 강화
4. 등급 3: 총판 / 골드 / 실버 → 신청 CTA

**문의하기 `/contact`** — 단일 폼
- 문의 유형(라디오): 상담신청 / 자료신청 / 일반문의 / 파트너
- 필드: 이름·회사명·회사 이메일·연락처·문의 내용·보안코드(캡차)·개인정보 동의(필수)·마케팅 동의(선택)·허니팟(website_url)
- 제출 후 "문의가 접수되었습니다" 모달

**접속하기 `/connect`** — "접속할 유니버스를 선택하세요"
- 클라우드 접속 환경: 공공 / 금융 / 민간(기업) 클라우드 × 리전 (대한민국/Asia, 미국/North America, 일본/Asia)
- "또는 ID로 접속하기" + 상담 신청 CTA
- 서비스 앱으로 보내는 **관문 페이지**라 일반 웹사이트 메뉴가 아니라 SaaS 진입 UX

---

## 2. pribit.com

### 2-1. 사이트맵 (공식 `/policy/sitemap` 기준)

| 구분 | 메뉴 | URL | 비고 |
|---|---|---|---|
| GNB | Technology | `/technology` | 기술 소개 |
| GNB | Products ▾ | `/products` | 하위 2개 |
| ↳ | PacketGo OS | `/products/os` | `/products`와 동일 내용 |
| ↳ | PacketGo ZTNA | `/products/ztna` | |
| GNB | Partnership | `mailto:sales@pribit.com` | **페이지 없음, 메일 링크** |
| GNB | News | `/news` | 게시판 (총 185건), 상세 `/news/2/{id}` |
| GNB | Company | `/company` | 회사 소개 |
| 유틸 | Home / Login / Join / Sitemap | `/member/login`, `/member/stipulation`, `/policy/sitemap` | 구 CMS 잔재. 약관상 "회원가입·로그인 절차 없음" |
| 유틸 | 언어 | KR `/` · EN `/en/` | 영문 홈은 별도 문구 |
| 푸터 | 개인정보처리방침 / 이용약관 | `/policy/privacy`, `/policy/terms` | |
| 푸터/GNB | SNS | 네이버 블로그, Instagram(링크 비어 있음), YouTube, LinkedIn, 메일 | |

### 2-2. 페이지별 구성

**홈 `/`** — 풀스크린 히어로 슬라이드("가장 안전하게, 가장 기업답게. AI 시대를 지휘하다.") → 슬로건 섹션("AI는 데이터를 쓰고, 시스템을 움직이며, 업무를 실행합니다") → Products 카드(OS / ZTNA, "자세히 보기") → Technology "알아보기" → 최신 뉴스 3건
- ⚠️ 슬라이드 제목에 `메인 배너2`, `test` 같은 **운영 중 미정리 placeholder**가 남아 있음 (복제하지 말 것)

**Technology `/technology`** — 신뢰 네트워크 → AI 실행 통제로의 확장
- 기술 3축: Trust Network Technology(SDP·EIG·마이크로세그멘테이션) / Data Flow Control / AI Execution Control
- "연결을 넘어, AI 실행까지 보는 기술" → "검증된 기술 자산"(특허·인증 성격)

**Products `/products` = `/products/os`** — PacketGo OS
- 도입 한 줄 → Overview → 구조도(Public AI / Private AI / 조직특성화 AI ← PacketGo OS 연결·통제 플랫폼: 정책·모델 라우팅·실행 통제 / 행위 분석·감사·위협 탐지 / 운영 관리·평가·학습·최적화) → 가치 3 섹션

**Products/ZTNA `/products/ztna`** — "PRIBIT Connect의 진화, 제로트러스트의 완성"
- Overview → Core Features 6(맥락 기반 접근 제어·SDP 비노출 연결·마이크로 세그멘테이션·지속 검증·접속 이후 데이터 흐름 관리·하이브리드) → N2SF 전환 CTA

**News `/news`** — 검색(제목/작성자/내용/제목+내용), 언론사·제목·날짜 리스트, 페이징, 상세 페이지(이전글/다음글/목록). 주요 소식: 사명 변경(프라이빗테크놀로지→프라이빗에이아이, 2026-07), 제로트러스트 시범사업 주관기업 선정, N2SF 에너지 클라우드 허브, 일본 수출 지원 등

**Company `/company`** — "AI가 향하는 모든 길에 신뢰를 설계합니다" · Our New Chapter · Vision("모든 조직이 자신만의 AI를 안전하게 실행하는 세상") · 슬로건 "Private Intelligence. Trusted Execution." · "이미 검증된 연결의 기술"(실적·인증)

---

## 3. 두 사이트 비교 / 시사점

| 항목 | packetgo.com | pribit.com |
|---|---|---|
| 목적 | 제품 판매·리드 확보 | 기업 신뢰·IR·홍보 |
| 메뉴 수 | 헤더 7 + 리소스 하위 3 | GNB 5 + 하위 2 |
| 제품 | AI OS / ZTNA / RISKi / N2SF | PacketGo OS / ZTNA |
| 전환 CTA | 문의하기·접속하기(항상 노출) | 메일(Partnership) 외 없음 |
| 콘텐츠 | 릴리즈노트·자료실·용어집·파트너 | 뉴스(언론 보도)·회사 |
| 폼 | 문의 폼(유형 4종, 캡차) | 없음 |
| 다국어 | 한국어만 | KR/EN |
| 품질 | 일관됨, 모바일/데스크톱 메뉴 불일치(N2SF) | 구 CMS 잔재(로그인/가입), test 문구, 빈 링크 |

**메뉴 설계 시 짚어볼 점**
1. 두 사이트를 **하나로 합치는지**(기업+제품 통합) 아니면 packetgo형(제품 중심) 또는 pribit형(기업 중심) 중 하나를 베이스로 할지
2. 제품 라인업이 다르다(RISKi, N2SF는 packetgo만). 어느 쪽을 기준으로 할지
3. 가져올 만한 것: 리소스 드롭다운(릴리즈노트/자료실/용어집), 파트너 프로그램, 문의 유형 라디오 폼, 산업별 섹션, 핵심 수치, 뉴스 게시판+검색
4. 버릴 것: 로그인/회원가입/사이트맵 유틸, `/connect` 관문(SY 서비스가 SaaS가 아니라면), 빈 Instagram 링크, placeholder 배너
5. 개선 후보: `/resources` 그룹 페이지 부재(403), 데스크톱 헤더에 N2SF 누락, Partnership이 mailto인 점
