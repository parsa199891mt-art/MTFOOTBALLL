const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- تنظیمات اولیه ---
const ADMIN_PASSWORD = 'mtfootball-admin';
const iranLeagueTeams = [
  'پرسپولیس','استقلال','سپاهان','تراکتور','فولاد','ذوب‌آهن','گل‌گهر',
  'آلومینیوم','ملوان','نساجی','پیکان','هوادار',
  'استقلال خوزستان','صنعت نفت','مس رفسنجان','شمس‌آذر'
];

// --- داده‌ها در حافظه (localStorage سرور نداریم، همه چیز تو RAM میمونه)
let coaches = {}; // مربی‌ها
let chosen = {}; // تیم‌های انتخاب شده
let currentCoach = '';

// --- API برای گرفتن همه تیم‌ها
app.get('/teams', (req, res) => {
  res.json(chosen);
});

// --- API انتخاب تیم توسط مربی
app.post('/select', (req, res) => {
  const { team, coach } = req.body;
  if (!team || !coach) return res.json({ success: false, message: 'اطلاعات ناقص' });
  if (chosen[team]) return res.json({ success: false, message: 'تیم قبلاً انتخاب شده' });
  chosen[team] = { by: 'coach', label: 'قفل شده توسط مربی', coachName: coach };
  res.json({ success: true });
});

// --- API ادمین
app.post('/admin', (req, res) => {
  const { team, action, password, name } = req.body;
  if (password !== ADMIN_PASSWORD) return res.json({ success: false, message: 'رمز غلط' });

  if (!iranLeagueTeams.includes(team)) return res.json({ success: false, message: 'تیم نامعتبر' });

  if (action === 'reserve') chosen[team] = { by: 'admin', label: 'رزرو شده', name };
  else if (action === 'lock_admin') chosen[team] = { by: 'admin', label: 'قفل شده توسط ادمین' };
  else if (action === 'free') delete chosen[team];
  else return res.json({ success: false, message: 'عملیات نامعتبر' });

  res.json({ success: true });
});

// --- تنظیمات عمومی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- پورت و هاست لیارا
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
