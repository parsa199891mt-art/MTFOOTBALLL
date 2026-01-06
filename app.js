/* ================== تنظیمات و داده‌ها ================== */

const KEY_COACHES = 'mtf_coaches_v1';
const KEY_TEAMS   = 'mtf_teams_v1';

const TEAMS = [
  'پرسپولیس','استقلال','سپاهان','تراکتور',
  'فولاد','ذوب‌آهن','گل‌گهر','آلومینیوم',
  'ملوان','نساجی','پیکان','هوادار',
  'استقلال خوزستان','صنعت نفت','مس رفسنجان','شمس‌آذر'
];

/* ================== localStorage ================== */

function loadCoaches(){
  return JSON.parse(localStorage.getItem(KEY_COACHES)) || {};
}
function saveCoaches(data){
  localStorage.setItem(KEY_COACHES, JSON.stringify(data));
}

function loadTeams(){
  return JSON.parse(localStorage.getItem(KEY_TEAMS));
}
function saveTeams(data){
  localStorage.setItem(KEY_TEAMS, JSON.stringify(data));
}

/* ================== state ================== */

let coaches = loadCoaches();
let teamsState = loadTeams();

if(!teamsState){
  teamsState = {};
  TEAMS.forEach(t=>{
    teamsState[t] = { status:'free' };
  });
  saveTeams(teamsState);
}

let currentTargetTeam = null;

/* ================== DOM ================== */

const teamsGrid = document.getElementById('teamsGrid');

const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');

const modalStepChoice = document.getElementById('modalStepChoice');
const modalRegister   = document.getElementById('modalRegister');
const modalLogin      = document.getElementById('modalLogin');

const modalTeamName = document.getElementById('modalTeamName');

const toRegisterBtn = document.getElementById('toRegisterBtn');
const toLoginBtn    = document.getElementById('toLoginBtn');

const regUsername = document.getElementById('reg_username');
const regPassword = document.getElementById('reg_password');
const doRegister  = document.getElementById('doRegister');
const backFromRegister = document.getElementById('backFromRegister');

const loginUsername = document.getElementById('login_username');
const loginPassword = document.getElementById('login_password');
const doLogin = document.getElementById('doLogin');
const backFromLogin = document.getElementById('backFromLogin');

/* ================== ابزار کمکی ================== */

function escapeHTML(text){
  return String(text).replace(/[&<>"']/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}

/* ======= محدودیت مهم: هر مربی فقط ۱ تیم ======= */
function coachAlreadyHasTeam(coachName){
  return Object.values(teamsState).some(
    t => t.coachName === coachName
  );
}

/* ================== رندر تیم‌ها ================== */

function renderTeams(){
  teamsGrid.innerHTML = '';

  TEAMS.forEach(team=>{
    const state = teamsState[team];
    const card = document.createElement('div');
    card.className = 'team-card';

    let statusHTML = '';
    if(state.status === 'free'){
      statusHTML = `<span class="team-status status-free">آزاد</span>`;
    }else{
      statusHTML = `<span class="team-status status-reserved">رزرو شده</span>`;
    }

    card.innerHTML = `
      <div class="team-name">${escapeHTML(team)}</div>
      ${statusHTML}
      <div style="margin-top:12px">
        ${
          state.status === 'free'
          ? `<button class="btn primary" data-team="${escapeHTML(team)}">رزرو</button>`
          : `<div style="font-size:13px;margin-top:6px">مربی: ${escapeHTML(state.coachName)}</div>`
        }
      </div>
    `;

    teamsGrid.appendChild(card);
  });

  document.querySelectorAll('[data-team]').forEach(btn=>{
    btn.onclick = ()=>{
      openModal(btn.dataset.team);
    };
  });
}

/* ================== modal ================== */

function openModal(team){
  currentTargetTeam = team;
  modalTeamName.innerText = team;

  regUsername.value = '';
  regPassword.value = '';
  loginUsername.value = '';
  loginPassword.value = '';

  modalStepChoice.classList.remove('hidden');
  modalRegister.classList.add('hidden');
  modalLogin.classList.add('hidden');

  modal.classList.remove('hidden');
}

function closeModal(){
  modal.classList.add('hidden');
  currentTargetTeam = null;
}

modalClose.onclick = closeModal;
modal.onclick = e => { if(e.target === modal) closeModal(); };

toRegisterBtn.onclick = ()=>{
  modalStepChoice.classList.add('hidden');
  modalRegister.classList.remove('hidden');
};

toLoginBtn.onclick = ()=>{
  modalStepChoice.classList.add('hidden');
  modalLogin.classList.remove('hidden');
};

backFromRegister.onclick = ()=>{
  modalRegister.classList.add('hidden');
  modalStepChoice.classList.remove('hidden');
};

backFromLogin.onclick = ()=>{
  modalLogin.classList.add('hidden');
  modalStepChoice.classList.remove('hidden');
};

/* ================== ثبت‌نام ================== */

doRegister.onclick = ()=>{
  const u = regUsername.value.trim();
  const p = regPassword.value.trim();

  if(!u || !p){
    alert('نام کاربری و رمز را وارد کنید');
    return;
  }

  if(coaches[u]){
    alert('این نام کاربری قبلا ثبت شده');
    return;
  }

  coaches[u] = p;
  saveCoaches(coaches);

  reserveTeamForCoach(u);
  closeModal();
};

/* ================== ورود ================== */

doLogin.onclick = ()=>{
  const u = loginUsername.value.trim();
  const p = loginPassword.value.trim();

  if(!coaches[u] || coaches[u] !== p){
    alert('نام کاربری یا رمز اشتباه است');
    return;
  }

  reserveTeamForCoach(u);
  closeModal();
};

/* ================== رزرو تیم ================== */

function reserveTeamForCoach(coachName){

  // محدودیت اصلی
  if(coachAlreadyHasTeam(coachName)){
    alert('❌ شما قبلاً یک تیم رزرو کرده‌اید');
    return;
  }

  const state = teamsState[currentTargetTeam];
  if(state.status !== 'free'){
    alert('این تیم قبلا رزرو شده');
    return;
  }

  teamsState[currentTargetTeam] = {
    status: 'reserved',
    coachName: coachName
  };

  saveTeams(teamsState);
  renderTeams();
}

/* ================== اجرا ================== */

document.addEventListener('DOMContentLoaded', ()=>{
  renderTeams();
});
