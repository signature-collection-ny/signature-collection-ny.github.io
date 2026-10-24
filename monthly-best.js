/* ============================================================
   MONTHLY BEST — 매달 여기만 바꾸면 메인 + 카탈로그에 같이 반영됩니다.
   - month: 표시할 달
   - items: 4~5개. name은 카탈로그 제품명과 똑같이 (대문자)
     img는 cards/ 폴더의 사진 파일명
   ============================================================ */
const MONTHLY_BEST = {
  month: { en: 'October 2026', ko: '2026년 10월' },
  items: [
    { name: 'ISABEL',   img: 'cards/36-isabel-approved.jpg',   en: 'Long layered body wave', ko: '롱 레이어드 바디 웨이브' },
    { name: 'QUEEN',    img: 'cards/44-queen-approved.jpg',    en: 'Shoulder-length tight curl', ko: '어깨 기장 타이트 컬' },
    { name: 'JANE',     img: 'cards/20-jane-approved.jpg',     en: 'Long silky straight', ko: '롱 실키 스트레이트' },
    { name: 'DESIGN A', img: 'cards/21-design-a-approved.jpg', en: 'Blunt bob with full bang', ko: '일자 보브 + 풀뱅' },
    { name: 'ASSIST',   img: 'cards/42-assist-approved.jpg',   en: 'Short layered pixie', ko: '숏 레이어드 픽시' }
  ]
};

(function () {
  const T = {
    en: { eyebrow: 'Monthly Best', title: 'This month’s picks', note: 'Five styles we are putting forward for your shelves this month.', view: 'VIEW', all: 'SEE ALL STYLES' },
    ko: { eyebrow: '이달의 베스트', title: '이달의 추천 스타일', note: '이번 달 매장에 먼저 걸어보시길 권하는 다섯 가지 스타일입니다.', view: '보기', all: '전체 스타일 보기' }
  };

  const css = `
  .mbest{padding:96px 0;border-top:1px solid var(--line)}
  .mbest-in{max-width:calc(var(--wrap,1200px) + var(--gutter,24px)*2);margin:0 auto;padding:0 var(--gutter,24px)}
  .mbest-head{display:grid;grid-template-columns:7fr 5fr;gap:64px;align-items:end;margin-bottom:48px}
  .mbest-head .mbest-eyebrow{display:flex;gap:16px;align-items:baseline;margin:0 0 16px;font:600 11px/1.4 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
  .mbest-head .mbest-eyebrow span{color:var(--muted)}
  .mbest-head h2{margin:0;font:400 clamp(36px,4.4vw,56px)/1.04 var(--sans);letter-spacing:-.015em;color:var(--ink)}
  .mbest-head>p{margin:0;color:var(--muted);font:400 16px/1.6 var(--sans)}
  .mbest-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:32px 24px}
  .mbest-item{grid-column:span 3;display:block;padding:0;border:0;background:none;text-align:left;color:var(--ink);text-decoration:none;cursor:pointer;font:inherit}
  .mbest-item:first-child{grid-column:span 6;grid-row:span 2}
  .mbest-photo{position:relative;aspect-ratio:3/4;background:var(--photo,#eee8de);overflow:hidden}
  .mbest-item:first-child .mbest-photo{aspect-ratio:auto;height:calc(100% - 81px)}
  .mbest-photo img{display:block;width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .6s ease}
  .mbest-item:hover img{transform:scale(1.03)}
  .mbest-meta{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:baseline;margin-top:16px;padding-top:16px;border-top:1px solid var(--ink)}
  .mbest-meta i{font:italic 500 28px/1 var(--serif);color:var(--gold)}
  .mbest-meta b{display:block;font:500 16px/1.2 var(--sans);letter-spacing:.04em}
  .mbest-meta small{display:block;margin-top:4px;font:400 13px/1.4 var(--sans);color:var(--muted)}
  .mbest-meta em{font:600 11px/1 var(--sans);font-style:normal;letter-spacing:.16em;color:var(--muted);white-space:nowrap}
  .mbest-item:first-child .mbest-meta i{font-size:40px}
  .mbest-item:first-child .mbest-meta b{font-size:20px}
  .mbest-all{margin-top:48px}
  .mbest-all a,.mbest-all button{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border:1px solid var(--ink);background:transparent;color:var(--ink);font:600 12px/1 var(--sans);letter-spacing:.18em;text-decoration:none;cursor:pointer}
  .mbest-all a:hover,.mbest-all button:hover{background:var(--ink);color:var(--ivory)}
  @media(max-width:960px){.mbest-head{grid-template-columns:1fr;gap:16px}.mbest-item{grid-column:span 6}.mbest-item:first-child{grid-column:span 12;grid-row:auto}.mbest-item:first-child .mbest-photo{aspect-ratio:3/4;height:auto}}
  @media(max-width:640px){.mbest{padding:48px 0}.mbest-head{margin-bottom:24px}.mbest-head>p{display:none}.mbest-head h2{font-size:30px}
  .mbest-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:var(--gutter,16px);gap:12px;margin:0 calc(var(--gutter,16px) * -1);padding:0 var(--gutter,16px) 8px;scrollbar-width:none}
  .mbest-grid::-webkit-scrollbar{display:none}
  .mbest-item,.mbest-item:first-child{flex:0 0 58%;scroll-snap-align:start}
  .mbest-item:first-child .mbest-photo{aspect-ratio:3/4;height:auto}
  .mbest-meta{grid-template-columns:auto 1fr;gap:2px 8px;margin-top:10px;padding-top:10px}.mbest-meta em{display:none}
  .mbest-meta i,.mbest-item:first-child .mbest-meta i{font-size:20px}.mbest-meta b,.mbest-item:first-child .mbest-meta b{font-size:14px}.mbest-meta small{font-size:12px}
  .mbest-all{margin-top:24px}.mbest-all a,.mbest-all button{min-height:44px;padding:0;border:0;text-decoration:underline;text-underline-offset:4px;background:none!important;color:var(--ink)!important}}
  @media(prefers-reduced-motion:reduce){.mbest-photo img{transition:none}}`;

  const onCatalog = typeof DATA !== 'undefined' && typeof openItem === 'function';
  const lang = () => (document.documentElement.lang || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';

  function build() {
    const L = lang(), t = T[L];
    const items = MONTHLY_BEST.items.slice(0, 5).map((it, i) => {
      const num = String(i + 1).padStart(2, '0');
      const inner = `<div class="mbest-photo"><img src="${it.img}" alt="${it.name}" loading="lazy"></div><div class="mbest-meta"><i>${num}</i><span><b>${it.name}</b><small>${it[L] || it.en}</small></span><em>${t.view} →</em></div>`;
      return onCatalog
        ? `<button type="button" class="mbest-item" data-name="${it.name}">${inner}</button>`
        : `<a class="mbest-item" href="signature-catalog-vendor.html#item=${encodeURIComponent(it.name)}">${inner}</a>`;
    }).join('');
    const all = onCatalog
      ? `<button type="button" data-all>${t.all}</button>`
      : `<a href="signature-catalog-vendor.html">${t.all}</a>`;
    return `<div class="mbest-in"><div class="mbest-head"><div><p class="mbest-eyebrow">${t.eyebrow}<span>${MONTHLY_BEST.month[L]}</span></p><h2 id="mbestTitle">${t.title}</h2></div><p>${t.note}</p></div><div class="mbest-grid">${items}</div><div class="mbest-all">${all}</div></div>`;
  }

  function wire(sec) {
    if (!onCatalog) return;
    sec.querySelectorAll('[data-name]').forEach(b => b.onclick = () => {
      const item = DATA.find(d => d.name === b.dataset.name);
      if (item) openItem(item.id);
    });
    const all = sec.querySelector('[data-all]');
    if (all) all.onclick = () => document.getElementById('styleGroups')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function mount() {
    if (!document.getElementById('mbest-styles')) {
      const st = document.createElement('style'); st.id = 'mbest-styles'; st.textContent = css; document.head.appendChild(st);
    }
    let sec = document.getElementById('monthlyBest');
    if (!sec) {
      sec = document.createElement('section'); sec.id = 'monthlyBest';
      const after = document.getElementById('newArrivalFeature') || document.querySelector('.intro');
      if (!after) return; after.after(sec);
    }
    sec.className = 'mbest'; sec.setAttribute('aria-labelledby', 'mbestTitle');
    const render = () => { sec.innerHTML = build(); wire(sec); };
    render();
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
