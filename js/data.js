// ═══════════════════════════════════════
//  DATA LAYER — 하드코딩 제거, 데이터 분리
// ═══════════════════════════════════════

var FEATURES = [
  {
    icon: '&#9635;',
    num: 'FEAT.01',
    title: '자동 데이터 수집',
    desc: 'Excel, CSV 등 다양한 형식의 재무 데이터를 자동으로 파싱하여 표준화된 데이터 구조로 변환합니다.'
  },
  {
    icon: '&#9881;',
    num: 'FEAT.02',
    title: '규칙 기반 검증',
    desc: 'K-IFRS 1019호의 47개 검증 규칙을 체계적으로 적용하여 데이터의 기준서 적합성을 판단합니다.'
  },
  {
    icon: '&#9906;',
    num: 'FEAT.03',
    title: '이상치 탐지',
    desc: '통계적 기법과 도메인 지식을 활용하여 보험수리적 가정의 이상값을 자동으로 식별합니다.'
  },
  {
    icon: '&#9776;',
    num: 'FEAT.04',
    title: '검증 리포트',
    desc: '검증 결과를 시각적으로 명확하게 보여주는 상세 리포트를 자동 생성하여 감사 대응을 지원합니다.'
  },
  {
    icon: '&#8644;',
    num: 'FEAT.05',
    title: '전기 비교 분석',
    desc: '당기와 전기 데이터를 자동 비교하여 주요 변동 사항을 분석하고 변동 원인을 추적합니다.'
  },
  {
    icon: '&#9745;',
    num: 'FEAT.06',
    title: '공시 체크리스트',
    desc: 'K-IFRS 1019호에서 요구하는 공시 항목의 누락 여부를 자동으로 확인하고 알림을 제공합니다.'
  }
];

var TEAM_MEMBERS = [
  {
    name: '이강준',
    nameEn: 'Lee Kangjun',
    dept: '항공우주공학과',
    deptEn: 'Aerospace Engineering',
    role: '데이터 파이프라인 설계 및 검증 엔진 코어 개발',
    roleEn: 'Data pipeline design and core validation engine development',
    roleLabel: 'Data Pipeline &amp; Core Engine',
    avatar: 'KJ',
    color: '0,240,255',
    desc: '검증 엔진 코어 로직 설계 및 데이터 파이프라인 구축을 담당합니다. 항공우주 분야의 정밀한 수치 해석 경험을 검증 시스템에 적용합니다.',
    tags: ['Python', 'pandas', 'FastAPI']
  },
  {
    name: '류상연',
    nameEn: 'Ryu Sangyeon',
    dept: '대기과학과',
    deptEn: 'Atmospheric Science',
    role: 'K-IFRS 1019호 기준서 분석 및 검증 규칙 정의',
    roleEn: 'K-IFRS 1019 standard analysis and validation rule definition',
    roleLabel: 'Data Analyst &amp; Validation Rules',
    avatar: 'SY',
    color: '168,85,247',
    desc: 'K-IFRS 1019호 기준서 분석 및 검증 규칙 정의를 담당합니다. 대기과학의 통계적 분석 역량을 활용하여 이상치 탐지 로직을 설계합니다.',
    tags: ['K-IFRS', '통계 분석', '데이터 검증']
  },
  {
    name: '박준환',
    nameEn: 'Park Junhwan',
    dept: '컴퓨터공학과',
    deptEn: 'Computer Science &amp; Engineering',
    role: '프론트엔드 대시보드 및 검증 결과 시각화 개발',
    roleEn: 'Frontend dashboard and validation result visualization development',
    roleLabel: 'Frontend &amp; Visualization',
    avatar: 'JH',
    color: '255,179,71',
    desc: '검증 결과 대시보드 및 리포트 시각화를 담당합니다. 사용자 경험을 최적화하여 직관적인 인터페이스를 구현합니다.',
    tags: ['React', 'D3.js', 'UI/UX']
  }
];

var TIMELINE = [
  {
    date: '2025.03 &mdash; 2025.04',
    title: '1단계: 요구사항 분석 및 설계',
    desc: 'K-IFRS 1019호 기준서 심층 분석, 검증 규칙 정의, 시스템 아키텍처 설계 및 프로토타입 기획'
  },
  {
    date: '2025.05 &mdash; 2025.06',
    title: '2단계: 코어 엔진 개발',
    desc: '데이터 파싱 모듈 구현, 검증 규칙 엔진 코어 개발, 단위 테스트 작성 및 1차 검증 로직 완성'
  },
  {
    date: '2025.07 &mdash; 2025.08',
    title: '3단계: 대시보드 및 리포트 개발',
    desc: '프론트엔드 대시보드 구현, 검증 결과 시각화, 자동 리포트 생성 기능 개발 및 API 연동'
  },
  {
    date: '2025.09 &mdash; 2025.10',
    title: '4단계: 통합 테스트 및 최적화',
    desc: '실제 재무 데이터 기반 통합 테스트, 성능 최적화, 사용자 피드백 반영 및 문서화'
  },
  {
    date: '2025.11',
    title: '5단계: 최종 발표 및 배포',
    desc: '프로젝트 최종 발표, 운영 환경 배포, 사용자 매뉴얼 작성 및 인수인계'
  }
];
