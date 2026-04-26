// Shared helpers and mock data — loaded first
// All globals attached to window for cross-script access.

const MOCK_EVENTS = [
  { eventId: 'a', title: 'Spring Camp 2026 — Reactive & Cloud Native', category: '컨퍼런스', price: 49000, remainingQuantity: 14, status: 'ON_SALE', eventDateTime: '2026-05-18T14:00', techStacks: ['Java', 'Spring Boot', 'Kafka'], location: '서울 강남구 코엑스 3층', host: 'Spring User Group Korea' },
  { eventId: 'b', title: 'React 한국 18차 밋업 — Server Components 실전', category: '밋업', price: 0, remainingQuantity: 42, status: 'ON_SALE', eventDateTime: '2026-04-27T19:30', techStacks: ['React', 'TypeScript', 'Node.js'], location: '판교 테크노밸리 공공지원센터', host: 'React Korea' },
  { eventId: 'c', title: 'GopherCon Korea 2026', category: '컨퍼런스', price: 129000, remainingQuantity: 3, status: 'ON_SALE', eventDateTime: '2026-06-11T09:00', techStacks: ['Go', 'gRPC'], location: '세종대학교 광개토관', host: 'GoLang Korea' },
  { eventId: 'd', title: 'Kubernetes & Platform Engineering 워크샵', category: '워크샵', price: 35000, remainingQuantity: 0, status: 'SOLD_OUT', eventDateTime: '2026-05-02T13:00', techStacks: ['Docker', 'Kubernetes', 'AWS'], location: '강남 패스트파이브', host: 'Cloud Native Korea' },
  { eventId: 'e', title: 'Rust Seoul 정기 해커톤', category: '해커톤', price: 20000, remainingQuantity: 8, status: 'ON_SALE', eventDateTime: '2026-05-25T10:00', techStacks: ['Rust'], location: '성수 언더스탠드에비뉴', host: 'Rust Seoul' },
  { eventId: 'f', title: '인프라 엔지니어를 위한 Terraform 심화', category: '스터디', price: 0, remainingQuantity: 24, status: 'ON_SALE', eventDateTime: '2026-05-09T20:00', techStacks: ['Terraform', 'AWS', 'CI/CD'], location: '온라인 (Zoom)', host: 'DevOps KR' },
  { eventId: 'g', title: 'AI Engineer 서밋 — LLM 프로덕션 운영', category: '컨퍼런스', price: 89000, remainingQuantity: 21, status: 'ON_SALE', eventDateTime: '2026-07-03T10:00', techStacks: ['Python', 'PyTorch', 'LangChain'], location: 'COEX 오디토리움', host: 'AI Engineer KR' },
  { eventId: 'h', title: 'TypeScript 5.7 마이그레이션 세미나', category: '세미나', price: 15000, remainingQuantity: 0, status: 'SOLD_OUT', eventDateTime: '2026-04-22T19:00', techStacks: ['TypeScript', 'React'], location: '선릉 마루180', host: 'TypeScript KR' },
];

const ACCENT = {
  a: '#4F46E5', b: '#0EA5E9', c: '#10B981', d: '#F59E0B',
  e: '#8B5CF6', f: '#EC4899', g: '#EF4444', h: '#0EA5E9',
};
const accent = (id) => ACCENT[id] || '#4F46E5';

function fmtDate(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${mi}`;
}
function fmtPrice(p) { return p === 0 ? 'free' : p.toLocaleString() + '원'; }
function fmtISO(iso) {
  const d = new Date(iso);
  return d.toISOString().slice(0,16).replace('T',' ');
}

// Category icon (Lucide-style inline SVGs)
const Icon = ({ name, size = 16 }) => {
  const paths = {
    folder: <><path d="M4 4h5l2 3h9v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></>,
    file:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    git:    <><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="12" r="3"/><path d="M6 9v6"/><path d="M6 9a9 9 0 0 0 9 9"/></>,
    ext:    <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    cart:   <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
    ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></>,
    sun:    <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
    moon:   <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    x:      <><path d="M18 6 6 18M6 6l12 12"/></>,
    chev:   <><polyline points="9 18 15 12 9 6"/></>,
    chevd:  <><polyline points="6 9 12 15 18 9"/></>,
    bell:   <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    check:  <><polyline points="20 6 9 17 4 12"/></>,
    play:   <><polygon points="5 3 19 12 5 21 5 3"/></>,
    wallet: <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></>,
    refund: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
    terminal: <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
    trash:  <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    plus:   <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:  <><line x1="5" y1="12" x2="19" y2="12"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    zap:    <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    pin:    <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// File icon (colored, for file tree / tabs)
const FileIcon = ({ kind = 'jsx', size = 14 }) => {
  const colors = { jsx: '#61DAFB', ts: '#3178C6', tsx: '#3178C6', go: '#00ADD8', rs: '#CE422B', json: '#CBD43B', md: '#42A5F5', py: '#FFD43B', css: '#1572B6' };
  const c = colors[kind] || '#94A3B8';
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6l-5-5z" fill={c} opacity="0.15" stroke={c} strokeWidth="1"/>
      <path d="M9 1v5h5" fill={c} opacity="0.35"/>
    </svg>
  );
};

window.MOCK_EVENTS = MOCK_EVENTS;
window.accent = accent;
window.fmtDate = fmtDate;
window.fmtPrice = fmtPrice;
window.fmtISO = fmtISO;
window.Icon = Icon;
window.FileIcon = FileIcon;
