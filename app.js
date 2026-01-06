/* ================== تنظیمات و داده‌ها ================== */

const ADMIN_PASSWORD = '19989114';

const KEY_COACHES = 'mtf_coaches_v1';
const KEY_TEAMS   = 'mtf_teams_v1';
const KEY_LEAGUE  = 'mtf_league_name_v1';
const KEY_ADMIN_OVERRIDE = 'mtf_admin_override';

const DEFAULT_LEAGUE_NAME = 'تیم‌های لیگ ایران';

const DEFAULT_TEAMS = [
  'پرسپولیس','استقلال','سپاهان','تراکتور',
  'فولاد','ذوب‌آهن','گل‌گهر','آلومینیوم',
  'ملوان','نساجی','پیکان','هوادار',
  'استقلال خوزستان','صنعت نفت','مس رفسجان','شمس‌آذر'
];

/* ================== ذخیره / بارگذاری ================== */
const load = (k,d) => {
  try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; }
};
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

let coaches = load(KEY_COACHES, {});
let teamsState = load(KEY_TEAMS, null);
let leagueName = load(KEY_LEAGUE, DEFAULT_LEAGUE_NAME);
let adminOverride = load(KEY_ADMIN_OVERRIDE, false);

if(!teamsState){
  teamsState = {};
  DEFAULT_TEAMS.forEach(t => teamsState[t] = { status:'free' });
  save(KEY_TEAMS, teamsState);
}

/* ================== DOM refs ================== */
const teamsGrid = document.getElementById('teamsGrid');
const leagueTitle = document.getElementById('leagueTitle');

const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalStepChoice = document.getElementById('modalStepChoice');
const modalRegister = document.getElementById('modalRegister');
const modalLogin = document.getElementById('modalLogin');
const modalTeamName = document.getElementById('modalTeamName');

const toRegisterBtn = document.getElementById('toRegisterBtn');
const toLoginBtn = document.getElementById('toLoginBtn');

const regUsername = document.getElementById('reg_username');
const regPassword = document.getElementById('reg_password');
const doRegister = document.getElementById('doRegister');
const backFromRegister = document.getElementById('backFromRegister');

const loginUsername = document.getElementById('login_username');
const loginPassword = document.getElementById('login_password');
const doLogin = document.getElementById('doLogin');
const backFromLogin = document.getElementById('backFromLogin');

const openAdminBtn = document.getElementById('openAdminBtn');
const adminPanel = document.getElementById('adminPanel');
const closeAdmin = document.getElementById('closeAdmin');
const adminPassInput = document.getElementById('adminPassInput');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminTools = document.getElementById('adminTools');
const leagueNameInput = document.getElementById('leagueNameInput');
const saveLeagueName = document.getElementById('saveLeagueName');
const teamsEditList = document.getElementById('teamsEditList');
const saveTeamNames = document.getElementById('saveTeamNames');
const resetTeams = document.getElementById('resetTeams');
const unlockAllBtn = document.getElementById('unlockAll');
const exportDataBtn = document.getElementById('exportData');

const blockOverlay = document.getElementById('blockOverlay');
const adminOverridePass = document.getElementById('adminOverridePass');
const adminOverrideBtn = document.getElementById('adminOverrideBtn');

/* ================== کمک‌ها ================== */
function escapeHTML(text){
  return String(text).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function coachAlreadyHasTeam(name){
  return Object.values(teamsState).some(t => t.coachName === name);
}

/* ================== نمایش / رندر ================== */
function renderTeams(){
  teamsGrid.innerHTML = '';
  Object.keys(teamsState).forEach(team => {
    const s = teamsState[team];
    const card = document.createElement('article');
    card.className = 'team-card';
    card.innerHTML = `
      <div class="team-name">${escapeHTML(team)}</div>
      <div>
        ${s.status === 'free'
          ? `<span class="team-status status-free">آزاد</span>`
          : `<span class="team-status status-reserved">رزرو شده</span>`
        }
      </div>
      <div style="margin-top:12px">
        ${s.status === 'free'
          ? `<button class="btn primary" data-team="${escapeHTML(team)}">رزرو</button>`
          : `<div style="font-size:13px;margin-bottom:6px">مربی: ${escapeHTML(s.coachName || '')}</div>`
        }
      </div>
    `;
    teamsGrid.appendChild(card);
  });

  document.querySelectorAll('[data-team]').forEach(btn=> btn.onclick = ()=> openModal(btn.dataset.team) );
}

/* ================== modal behavior ================== */
let currentTargetTeam = null;
function openModal(team){
  currentTargetTeam = team;
  modalTeamName.textContent = team;
  regUsername.value = regPassword.value = loginUsername.value = loginPassword.value = '';
  modalStepChoice.classList.remove('hidden');
  modalRegister.classList.add('hidden');
  modalLogin.classList.add('hidden');
  modal.classList.remove('hidden');
}
function closeModal(){ modal.classList.add('hidden'); currentTargetTeam = null; }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
toRegisterBtn.addEventListener('click', ()=>{ modalStepChoice.classList.add('hidden'); modalRegister.classList.remove('hidden'); });
toLoginBtn.addEventListener('click', ()=>{ modalStepChoice.classList.add('hidden'); modalLogin.classList.remove('hidden'); });
backFromRegister.addEventListener('click', ()=>{ modalRegister.classList.add('hidden'); modalStepChoice.classList.remove('hidden'); });
backFromLogin.addEventListener('click', ()=>{ modalLogin.classList.add('hidden'); modalStepChoice.classList.remove('hidden'); });

/* ================== ثبت‌نام / ورود و محدودیت 1 تیم ================== */
doRegister.addEventListener('click', ()=>{
  const u = regUsername.value.trim(), p = regPassword.value.trim();
  if(!u || !p){ alert('نام کاربری و رمز را وارد کنید'); return; }
  if(coaches[u]){ alert('این نام کاربری قبلا ثبت شده — لطفا وارد شوید'); return; }
  if(coachAlreadyHasTeam(u)){ alert('شما قبلاً یک تیم رزرو کرده‌اید'); return; }
  coaches[u] = p;
  save(KEY_COACHES, coaches);
  reserveAsCoach(u);
  closeModal();
});

doLogin.addEventListener('click', ()=>{
  const u = loginUsername.value.trim(), p = loginPassword.value.trim();
  if(!coaches[u] || coaches[u] !== p){ alert('نام کاربری یا رمز اشتباه است'); return; }
  if(coachAlreadyHasTeam(u)){ alert('شما قبلاً یک تیم رزرو کرده‌اید'); return; }
  reserveAsCoach(u);
  closeModal();
});

function reserveAsCoach(coachName){
  if(!currentTargetTeam){ alert('تیمی انتخاب نشده'); return; }
  const s = teamsState[currentTargetTeam];
  if(s.status !== 'free'){ alert('این تیم قبلا رزرو شده'); return; }
  teamsState[currentTargetTeam] = { status:'reserved', coachName };
  save(KEY_TEAMS, teamsState);
  renderTeams();
}

/* ================== admin UI (گرافیکی) ================== */
function openAdminPanel(){
  adminPanel.classList.add('visible');
}
function closeAdminPanel(){
  adminPanel.classList.remove('visible');
}

openAdminBtn.addEventListener('click', ()=> {
  openAdminPanel();
  // show only pass input until login
  adminTools.classList.add('hidden');
});

closeAdmin.addEventListener('click', closeAdminPanel);

adminLoginBtn.addEventListener('click', ()=>{
  const pass = adminPassInput.value;
  if(pass !== ADMIN_PASSWORD){ alert('رمز ادمین اشتباه است'); return; }
  adminTools.classList.remove('hidden');
  leagueNameInput.value = leagueName;
  populateTeamsEdit();
});

/* league name save */
saveLeagueName.addEventListener('click', ()=>{
  const v = leagueNameInput.value.trim();
  if(!v) return alert('نام لیگ خالی است');
  leagueName = v;
  save(KEY_LEAGUE, leagueName);
  document.getElementById('leagueTitle').textContent = leagueName;
  alert('نام لیگ ذخیره شد');
});

/* populate team edit list */
function populateTeamsEdit(){
  teamsEditList.innerHTML = '';
  Object.keys(teamsState).forEach(oldName=>{
    const row = document.createElement('div');
    row.className = 'team-edit-row';
    const inp = document.createElement('input');
    inp.value = oldName;
    inp.dataset.original = oldName;
    row.appendChild(inp);
    teamsEditList.appendChild(row);
  });
}

/* save edited team names */
saveTeamNames.addEventListener('click', ()=>{
  const inputs = Array.from(teamsEditList.querySelectorAll('input'));
  const newMap = {};
  // build new map and handle duplicates by suffix
  inputs.forEach(inp=>{
    const orig = inp.dataset.original;
    let name = inp.value.trim();
    if(!name) name = orig;
    // if name collision with previously set, add suffix
    let finalName = name;
    let i = 1;
    while(Object.prototype.hasOwnProperty.call(newMap, finalName)){
      finalName = name + ' (' + i + ')';
      i++;
    }
    newMap[finalName] = teamsState[orig]; // transfer state
  });
  teamsState = newMap;
  save(KEY_TEAMS, teamsState);
  populateTeamsEdit();
  renderTeams();
  alert('اسامی تیم‌ها ذخیره شد');
});

resetTeams.addEventListener('click', ()=>{
  if(!confirm('آیا مطمئنی می‌خواهی اسامی تیم‌ها به حالت پیش‌فرض بازگردد؟')) return;
  teamsState = {};
  DEFAULT_TEAMS.forEach(t => teamsState[t] = { status:'free' });
  save(KEY_TEAMS, teamsState);
  populateTeamsEdit();
  renderTeams();
  alert('تیم‌ها بازگشتند');
});

unlockAllBtn.addEventListener('click', ()=>{
  if(!confirm('همه تیم‌ها آزاد شوند؟')) return;
  Object.keys(teamsState).forEach(k => teamsState[k] = { status:'free' });
  save(KEY_TEAMS, teamsState);
  renderTeams();
  alert('همه تیم‌ها آزاد شدند');
});

exportDataBtn.addEventListener('click', ()=>{
  const data = { leagueName, teamsState, coaches };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mtfootball_export.json'; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
});

/* ================== block by country (heuristic + optional IP lookup) ================== */

/*
  توضیح: چون سایت فعلا آفلاین (بدون سرور)، نمی‌توان به‌طور کامل جلوی کشور خاص را گرفت.
  اینجا رویکرد چندمرحله‌ای است:
   - بررسی timezone برای Jerusalem
   - بررسی زبان مرورگر برای he / he-IL
   - سپس تلاش برای تماس به سرویس ipapi.co (اختیاری، زمان‌بر) با timeout 2s
  اگر کشور 'IL' تشخیص داده شود، overlay نمایش داده می‌شود.
  ادمین می‌تواند با رمز وارد شود و override را فعال کند.
*/

async function detectCountryCode(){
  try{
    // heuristic: timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if(tz.toLowerCase().includes('jerusalem')) return 'IL';
    // heuristic: language
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    if(lang && lang.toLowerCase().startsWith('he')) return 'IL';
    // try remote geolocation (optional, may fail offline) with timeout
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), 2200);
    try{
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timer);
      if(!res.ok) return null;
      const j = await res.json();
      return j && j.country_code ? j.country_code.toUpperCase() : null;
    }catch(e){
      clearTimeout(timer);
      return null;
    }
  }catch(e){
    return null;
  }
}

function showBlockedOverlay(){
  blockOverlay.classList.remove('hidden');
  blockOverlay.setAttribute('aria-hidden','false');
}

function hideBlockedOverlay(){
  blockOverlay.classList.add('hidden');
  blockOverlay.setAttribute('aria-hidden','true');
}

/* admin override from overlay */
adminOverrideBtn.addEventListener('click', ()=>{
  const v = adminOverridePass.value;
  if(v === ADMIN_PASSWORD){
    adminOverride = true;
    save(KEY_ADMIN_OVERRIDE, true);
    hideBlockedOverlay();
  } else {
    alert('رمز ادمین اشتباه است');
  }
});

/* initial check */
(async function countryCheck(){
  if(adminOverride){ hideBlockedOverlay(); return; }
  const code = await detectCountryCode();
  if(code === 'IL'){ showBlockedOverlay(); } else { hideBlockedOverlay(); }
})();

/* ================== initial render ================== */
leagueTitle.textContent = leagueName;
renderTeams();
populateTeamsEdit();

/* allow admin open by double-click on title as well */
leagueTitle.ondblclick = ()=> openAdminPanel();
