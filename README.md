# HALE Premium GitHub Pages Build

이 버전은 기존 HALE 구조를 유지하면서 전체 디자인과 인터랙션을 프리미엄 다크 에이전시/플래그십 사이트 톤으로 업그레이드한 GitHub Pages 배포본입니다.

구성:
- `index.html` : 페이지 구조, 섹션, 모달, 내비게이션
- `assets/css/main.css` : 전체 디자인 시스템, 레이아웃, 애니메이션, 반응형 스타일
- `assets/js/vendor/instanced-mouse-effect.bundle.js` : WebGL 인스턴싱 배경 번들
- `assets/js/app/main.js` : 섹션 인터랙션, 스크롤, 카운터, 모달, 시계, 배경 초기화

핵심 변경:
- 고급 대기업 / 시크릿 에이전트 톤의 다크 UI 재설계
- 기존 WebGL 배경 위에 프리미엄 히어로 레이아웃 구성
- Profile / Timeline / Secure Access 섹션 추가
- 버튼, 상단 내비게이션, 인터랙션, 모달, 카운터 애니메이션 추가
- GitHub Pages 그대로 배포 가능한 정적 구조 유지

배포 방법:
1. 이 폴더 내용을 저장소 루트 또는 `docs/` 폴더에 업로드
2. GitHub Settings → Pages 에서 배포 경로 선택
3. 배포된 URL에서 바로 사용
