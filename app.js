// ساده، مستقل و با localStorage — همه فایل‌ها جدا هستند
// keyهای localStorage:
const KEY_COACHES = 'mtf_coaches_v1';
const KEY_TEAMS   = 'mtf_teams_v1';

// لیست 16 تیم لیگ ایران
const TEAMS = [
  'پرسپولیس','استقلال','سپاهان','تراکتور',
  'فولاد','ذوب‌آهن','گل‌گهر','آلومینیوم',
  'ملوان','نساجی','پیکان','هوادار',
  'استقلال خوزستان','صنعت نفت','مس رفسنجان','شمس‌آذر'
];

/* ------ helper: ذخیره / خواندن از localStorage ------ */
function loadCoaches(){
  try{ return JSON.parse(localStorage.getItem(KEY_COACHES)) || {}; }
  catch(e){ return {}; }
}
function saveCoaches(obj){ localStorage.setItem(KEY_COACHES, JSON.stringify(obj)); }

function loadTeams(){
  try{ return JSON.parse(localStorage.getItem(KEY_TEAMS)) || null; }
  catch(e){ return null; }
}
function saveTeams(obj){ localStorage.setItem(KEY_TEAMS, JSON.stringify(obj)); }

/* ------ state runtime ------ */
let coaches = loadCoaches();
let teamsState = loadTeams();
if(!teamsState){
  teamsState = {}; // teamsState[team] = { status:'free'|'reserved', by: 'coach'|'admin', name: 'ali' , coachName: 'ali' }
  TEAMS.forEach(t => teamsState[t] = { status:'free' });
  saveTeams(teamsState);
}

/* ------ DOM refs ------ */
const teamsGrid = document.getElementById('teamsGrid');

// modal refs
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

let currentTargetTeam = null; // تیمی که کاربر قصد رزرو داره

/* ------ render UI ------ */
function renderTeams(){
  teamsGrid.innerHTML = '';
  TEAMS.forEach(team => {
    const state = teamsState[team] || { status:'free' };
    const card = document.createElement('article');
    card.className = 'team-card';
    card.innerHTML = `
      <div class="team-name">${escapeHTML(team)}</div>
      <div>
        ${
          state.status === 'free'
          ? `<span class="team-status status-free">آزاد</span>`
          : state.status === 'locked'
            ? `<span class="team-status status-locked">قفل شده</span>`
            : `<span class="team-status status-reserved">رزرو شده</span>`
        }
      </div>
      <div style="margin-top:12px;">
        ${state.status === 'free'
          ? `<button class="btn primary" data-team="${escapeHTML(team)}">رزرو</button>`
          : (state.coachName ? `<div class="note" style="color:#cbd5e1;margin-bottom:8px">مربی: ${escapeHTML(state.coachName)}</div>` : '') +
            (state.name ? `<div class="note" style="color:#cbd5e1;margin-bottom:8px">رزرو به نام: ${escapeHTML(state.name)}</div>` : '') +
            `<button class="btn" data-team-view="${escapeHTML(team)}">مشاهده</button>`
        }
      </div>
    `;
    teamsGrid.appendChild(card);
  });

  // دکمه‌های رزرو جدید اضافه کن
  teamsGrid.querySelectorAll('button[data-team]').forEach(btn => {
    btn.addEventListener('click', e => {
      const t = e.currentTarget.getAttribute('data-team');
      openModalForTeam(t);
    });
  });
  // دکمه مشاهده (فقط نمایش جزئیات) 
  teamsGrid.querySelectorAll('button[data-team-view]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const t = e.currentTarget.getAttribute('data-team-view');
      alert(getTeamInfoText(t));
    });
  });
}

/* ------ امن‌سازی متن برای جلوگیری از XSS ------ */
function escapeHTML(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, (m) => {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* ------ متن اطلاعات تیم برای مشاهده ------ */
function getTeamInfoText(team){
  const s = teamsState[team];
  if(!s || s.status === 'free') return `${team}\nوضعیت: آزاد`;
  let parts = [`${team}`, `وضعیت: ${s.status === 'reserved' ? 'رزرو شده' : s.status}`];
  if(s.name) parts.push(`رزرو به نام: ${s.name}`);
  if(s.coachName) parts.push(`مربی: ${s.coachName}`);
  return parts.join('\n');
}

/* ------ modal behavior ------ */
function openModalForTeam(team){
  currentTargetTeam = team;
  modalTeamName.textContent = team;
  // reset forms
  regUsername.value = '';
  regPassword.value = '';
  loginUsername.value = '';
  loginPassword.value = '';
  // show choice step
  modalStepChoice.classList.remove('hidden');
  modalRegister.classList.add('hidden');
  modalLogin.classList.add('hidden');
  showModal();
}

function showModal(){ modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); }
function closeModal(){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); currentTargetTeam = null; }

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

toRegisterBtn.addEventListener('click', ()=>{ modalStepChoice.classList.add('hidden'); modalRegister.classList.remove('hidden'); });
toLoginBtn.addEventListener('click', ()=>{ modalStepChoice.classList.add('hidden'); modalLogin.classList.remove('hidden'); });

backFromRegister.addEventListener('click', ()=>{ modalRegister.classList.add('hidden'); modalStepChoice.classList.remove('hidden'); });
backFromLogin.addEventListener('click', ()=>{ modalLogin.classList.add('hidden'); modalStepChoice.classList.remove('hidden'); });

/* ------ register & login logic (localStorage) ------ */
doRegister.addEventListener('click', ()=>{
  const username = regUsername.value.trim();
  const password = regPassword.value.trim();
  if(!username || !password){ alert('نام کاربری و رمز را وارد کنید'); return; }
  if(coaches[username]){ alert('این نام کاربری قبلا ثبت شده — لطفا وارد شوید'); return; }
  coaches[username] = password;
  saveCoaches(coaches);
  // بعد از ثبت‌نام، بلافاصله رزرو کن
  reserveAsCoach(currentTargetTeam, username);
  closeModal();
});

doLogin.addEventListener('click', ()=>{
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if(!username || !password){ alert('نام کاربری و رمز را وارد کنید'); return; }
  if(!coaches[username] || coaches[username] !== password){ alert('نام کاربری یا رمز اشتباه است'); return; }
  // بعد از ورود، رزرو کن
  reserveAsCoach(currentTargetTeam, username);
  closeModal();
});

/* ------ عملیات رزرو به نام مربی ------ */
function reserveAsCoach(team, coachName){
  if(!team) { alert('تیمی انتخاب نشده'); return; }
  const st = teamsState[team];
  if(st && st.status !== 'free'){ alert('متاسفانه این تیم قبلا رزرو شده'); return; }
  teamsState[team] = { status:'reserved', by:'coach', coachName: coachName };
  saveTeams(teamsState);
  renderTeams();
}

/* ------ initial render ------ */
document.addEventListener('DOMContentLoaded', function(){
  renderTeams();
});
