# 유튜브 AI 도구 영상 29개 정리 (2026-11-10)

영상 자막·설명란·고정 댓글을 기준으로 정리. 저장소/별 수/라이선스는 2026-11-10 GitHub API로 재확인(영상 속 숫자보다 대부분 늘어남).

## 1. 한눈에 보기 — 주제별 핵심

| 주제 | 핵심 메시지 |
|---|---|
| 스킬 기본 | 매번 반복하는 지시는 `SKILL.md`로 저장 → 한 마디로 호출 (638자 → 14자) |
| 웹 디자인 품질 | AI 티(흰 바탕+파란 포인트, 템플릿 느낌)를 없애는 스킬: unslop, taste-skill, impeccable, apple-design, MotionSites, frontend-design |
| 작업 효율 | 계획→검증(superpowers), 기억(claude-mem, ai-memory), 스킬 검색(find-skills), 토큰 절약(Ponytail, Graphify, Headroom) |
| 마케팅/SNS | 마케팅 스킬 53개, 인스타 에이전트 스킬 13개, 릴스 첫 줄 공식, 인스타 API 자동 게시 |
| 영상 제작 | HyperFrames(HTML→영상), 효과음(Openverse, Real SFX, earshot), 스타일 복사, Higgsfield |
| 커넥터 | Claude Academy, Notion, Canva, Zoom, Fiverr — 모르는 회사 커넥터는 연결 금지 |
| 트렌드 | REA 리버스 엔지니어링, Same(사이트 복제), 바이브코딩 1인 창업 사례 |

## 2. 영상별 요약

| # | 영상 | 내용 | 도구 |
|---|---|---|---|
| 1 | 인스타 담당자 스킬 13개 | 릴스 주제 → 훅 공식 26개 중 3개로 대본, 주간 업로드 계획, 평소 대비 조회수 배수로 터진 릴스 찾기 | instagram-agent-skill |
| 2 | 매번 치던 명령을 한 마디로 | 반복 지시를 SKILL.md에 담아 슬래시 명령으로 실행 (책 『클로드 코드 제대로 시작하기』 10.5장) | Claude Code Skills |
| 3 | 클로드 앱에 꼭 연결할 5가지 | Claude Academy, Notion, Canva, Zoom, Fiverr 커넥터. `+ → 커넥터`. 처음 보는 회사 커넥터는 금지 | 커넥터 |
| 4 | 앱 통째로 복사하는 오픈소스 | REA로 윈도우 그림판을 재구현 + 에셋 패널 추가, 약 11분 | REA |
| 5 | AI 릴스 124개 첫 줄 공식 | ① 궁금증 질문 → 번호 단계 ② 오늘 만든 것 한 줄 보고 ③ 큰 숫자 대비(조회수·돈) | — |
| 6 | 한도 끝나도 코덱스가 이어받기 | ai-memory: 20개+ 도구가 같은 마크다운 기억 공유, 인계장. 윈도우는 실험 단계(WSL 권장), 명령 기록되니 비밀번호 주의 | ai-memory |
| 7 | 클로드 토큰 아끼는 법 | Ponytail(출력 최적화 50%↓), Graphify(코드 그래프 검색 70%↓), Headroom(요청/결과 압축) | 플러그인 3종 |
| 8 | unslop | 화면의 AI 티를 줄 번호까지 찾아 제품 맞춤으로 수정, 10초 과정 영상 | unslop |
| 9 | MotionSites 스킬 | 수상작 같은 시네마틱 사이트: 디자인 40, 영상 50+, 애니메이션 기법 55+. 기획서→영상선택→제작→스크린샷 검수 | MotionSites |
| 10 | 깃허브 별 10만 AI 티 지우는 스킬 | taste-skill 2.0: 가게 특징 추출 → 디자인 방향 20개 중 선택 → 3개 화면 크기로 브라우저 검수 → 상위 문제 3개를 최대 3회 수정. 30~45분, 토큰 많이 씀 → 메인 페이지에만 | taste-skill |
| 11 | 인스타 자동화 5단계 | Meta 개발자 앱 → 내 인스타 테스터 등록 → 액세스 토큰 → .env 저장 → 말로 게시. 예약 게시는 PC 켜져 있어야 | Instagram Graph API |
| 12 | 브랜드 사이트 2,000개 디자인 파일 | DESIGN.md(색·글꼴·여백·부품) 복사 → "이 스타일로". 공식 가이드 아님, 베타 | Refero Styles |
| 13 | 광고 문구부터 문의 화면까지 | 광고 계정 점검 → 서비스별 검색어 묶기 → 지역 광고(일시중지 상태로 생성) → 제목/설명 다수 → 랜딩+문의폼 | Google Ads 연동 |
| 14 | 이틀 만에 상위 10% | 1일차: 질문 50개로 '나에 대한 문서' + 세컨드 브레인 + 프로젝트. 2일차: MCP로 앱 연결 + 스킬 설치 | — |
| 15 | 숏폼 공장 | Higgsfield Content Factory + Claude 연결 → 문장 하나로 30초 애니메이션 | Higgsfield |
| 16 | 20대 셋이 넉 달에 50만 명 | Same(URL → 사이트 복제). 완성 전 공개, 과정 공개가 곧 광고 | — |
| 17 | 효과음 자동 편집 | Openverse(500만+ 효과음 검색), Real SFX(타임라인 분석 후 프레임 단위 배치), earshot(코드로 새 효과음 생성) | SFX 3종 |
| 18 | 마케팅 스킬 52개 | 카피·SEO·광고·이메일·가격. product-marketing-context에 서비스/고객 정리하면 나머지 스킬이 참조 | marketingskills |
| 19 | I'm not AI 윤문 스킬 | "AI 티 없애줘", "윤문해줘"로 실행되는 한국어 휴머나이저 | im-not-ai |
| 20 | 유튜브 채널 자동화 5단계 | 니치 탐색+구글 트렌드 → 우수 채널 벤치마킹 → 커스텀 MCP → 배너/프로필 생성 → 대본·음성·영상 일괄 | 커스텀 MCP |
| 21 | 코덱스로 웹사이트·마케팅 | 커넥터 연동 → 플랜 모드 랜딩 + 스크린샷 자율 검증 → 매일 9시 뉴스레터 → 12p 마케팅 기획서 → HyperFrames 30초 영상 | Codex |
| 22 | apple-design | WWDC 'Designing Fluid Interfaces' 원칙: 즉시 반응, 손가락 추종, 속도 이어받기, 고무줄 바운스. 기존 사이트 검토도 가능 | apple-design |
| 23 | REA 실험 | 실행 파일만으로 C 코드 216줄 복원(함수 14개 중 13개, 89% 일치). 상용 프로그램 재판매는 저작권 문제 | REA |
| 24 | 바이브코딩 4개월 월 $11,200 | Lovable로 시작해 Vugola(유튜브→세로 클립+예약 게시) 제작, 유료 400명 | — |
| 25 | 얼굴 없이 AI 브랜딩 | 이키가이 4질문 → 스킬로 시장조사 → Higgsfield 아바타 → ElevenLabs 보이스 → 주간 자동 제작 | Higgsfield, ElevenLabs |
| 26 | 이번 주 깃허브 신작 3개 | cinematic-shot(앱 화면 영화처럼), stop-describing-ui(설명투 문구 규칙 9개), papercut-explainer(종이 컷아웃 영상, 편당 API $14~19) | 스킬 3종 |
| 27 | 스킬 10만 개 중 진짜 5개 | find-skills, superpowers, claude-mem, impeccable, frontend-design | 스킬 5종 |
| 28 | 컴맹도 클로드로 영상 | HyperFrames 스킬 + 참고 쇼츠 링크 → 대본·음성·애니메이션 → "자막 더 크게" → MP4 렌더 | HyperFrames |
| 29 | 스타일 복붙 편집 | 마음에 드는 영상 하나를 주면 글꼴·색·움직임을 읽어 내 영상에 적용 | (HyperFrames류) |

## 3. 설치 가능한 도구 (검증된 저장소)

| 도구 | 저장소 | 별 | 설치 | 주의 |
|---|---|---|---|---|
| unslop | heydamir/unslop | 12.9k | clone 후 `skills/unslop` → `~/.claude/skills/` | 라이브 사이트/영상은 Playwright·ffmpeg |
| taste-skill | Leonxlnx/taste-skill | 112.7k | `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend` | Chrome/Edge 필요, 토큰 많이 씀 |
| impeccable | pbakaus/impeccable | 107k | `npx impeccable install` | 디자인 훅 추가 + 엔진 바이너리 다운로드 |
| apple-design | emilkowalski/skills | 55.5k | `npx skills add https://github.com/emilkowalski/skills --skill apple-design` | — |
| MotionSites | Motionsites-AI/claude-skill | 1.9k | 플러그인 마켓플레이스 | Python Playwright |
| stop-describing-ui | artouc/stop-describing-ui | 92 | `npx skills add artouc/stop-describing-ui` | — |
| cinematic-shot | 1weiho/skills | 240 | `npx skills add 1weiho/skills --skill cinematic-shot` | — |
| superpowers | obra/superpowers | 315k | `/plugin install superpowers@claude-plugins-official` | — |
| find-skills | vercel-labs/skills | 38.8k | `npx skills add vercel-labs/skills --skill find-skills` | — |
| claude-mem | thedotmack/claude-mem | 115.5k | `npx claude-mem install` | 익명 텔레메트리 기본 ON |
| Ponytail | DietrichGebert/ponytail | 188k | 플러그인 마켓플레이스 | .exe/.dll 포함본은 가짜 |
| Graphify | Graphify-Labs/graphify | 145k | `pip install graphifyy && graphify install` | 패키지명 y 두 개 |
| Headroom | headroomlabs-ai/headroom | 79k | `uv tool install "headroom-ai[all]"` → `headroom wrap claude` | 로컬 프록시로 Claude를 감쌈 |
| ai-memory | akitaonrails/ai-memory | 15.5k | 플러그인 + 서버 바이너리 | 윈도우 실험 단계 |
| marketingskills | coreyhaines31/marketingskills | 59.5k | `npx skills add coreyhaines31/marketingskills` | 53개 스킬 |
| instagram-agent | Jakeschincariol/instagram-agent-skill | 5.7k | 플러그인 또는 `skills/ig-*` 복사 | Python 보조 스크립트 |
| im-not-ai | epoko77-ai/im-not-ai | 6.5k | `/plugin install humanize-korean@im-not-ai` | — |
| HyperFrames | heygen-com/hyperframes | 81.9k | `npx skills add heygen-com/hyperframes` | Node 22+, FFmpeg |
| Real SFX | Clipwing/skills | 100 | clone 후 `skills/real-sfx` 복사 | Python, FFmpeg, 라이선스 없음 |
| earshot | Leonxlnx/earshot | 4.4k | uv tool + MCP 등록 | 모델 약 1.1GB |
| papercut-explainer | 0xS4N4TG/papercut-explainer | 173 | `npx skills add ...` | **윈도우는 WSL 전용**, API 비용 |
| REA | morluto/rea | — | `npx rea-agents setup` | Ghidra/JDK, 윈도우 실험적, 저작권 주의 |

### 직접 해야 하는 것 (계정 연결)
- Claude 앱 커넥터: Claude Academy, Notion, Canva, Zoom, Fiverr → 채팅창 `+` → 커넥터
- Instagram Graph API 토큰, Higgsfield, ElevenLabs, Google Ads 계정 연결
- Refero Styles(styles.refero.design): 브라우저에서 DESIGN.md 복사해 사용

### 설치 결과 (2026-11-10)
- ✅ 플러그인 11개: superpowers, ponytail, motionsites-web-builder, marketing-skills, instagram-agent, humanize-korean, hyperframes, taste-skill, ai-memory, claude-mem(텔레메트리 끔), impeccable
- ✅ 스킬 7개: apple-design, find-skills, stop-describing-ui, cinematic-shot, unslop, real-sfx, graphify
- ✅ 도구: Graphify, Headroom, earshot(MCP 등록·모델 다운로드), ffmpeg, ai-memory 서버(127.0.0.1:49374)
- ✅ REA 6.8.0: Node 24.22.1로 업그레이드 후 MCP·스킬 등록 (Ghidra·JDK 미설치 → 실행 파일 디컴파일은 아직 불가, JS·웹 번들 분석은 가능)
- ⏸ Headroom `headroom wrap claude`: 모든 Claude 요청을 로컬 프록시로 보내므로 실행 보류
- ✖ papercut-explainer: 윈도우는 WSL 전용이라 제외
- 👤 직접 연결: Claude Academy·Zoom·Fiverr 커넥터(Notion·Canva는 이미 연결됨), Higgsfield, Instagram API

## 4. SY WEBSITE 프로젝트에 바로 쓸 것
1. 메인 페이지 1회: **taste-skill** (방향 결정 + 브라우저 검수, 비용 큼)
2. 각 페이지 마감 전: **unslop** 또는 **impeccable**로 AI 티 점검
3. 인터랙션: **apple-design** 원칙(즉시 반응·관성·바운스)
4. 화면 문구: **stop-describing-ui** 규칙으로 설명투 제거
5. 레퍼런스: Refero DESIGN.md를 결 참고용으로만 사용(브랜드 복제 금지)
6. 오픈 후: **marketingskills**의 product-marketing-context부터 작성 → 랜딩 전환율 진단
