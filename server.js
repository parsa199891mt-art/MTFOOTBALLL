const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();                      // ← خط ۳: ساخت اپ Express
const PORT = process.env.PORT || 3000;      // ← خط ۴: پورت از متغیر محیطی یا 3000

// گرفتن رمز ادمین از متغیر محیطی یا مقدار پیش‌فرض
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mtfootball-admin";

app.use(express.json());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'teams.json');

// گرفتن لیست تیم‌ها
app.get('/teams', (req, res) => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error reading teams file' });
  }
});

// انتخاب تیم توسط بازیکن
app.post('/select', (req, res) => {
  const { team, coach } = req.body;
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    if (!data[team]) return res.json({ success: false, message: 'Team not found' });
    if (data[team].status !== 'free') return res.json({ success: false, message: 'Team already taken' });

    data[team].status = 'taken';
    data[team].coach = coach || '';

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating teams file' });
  }
});

// عملیات ادمین (reserve / lock_admin / free)
app.post('/admin', (req, res) => {
  const { team, action, password } = req.body;

  if (password !== ADMIN_PASSWORD) return res.json({ success: false, message: 'Wrong admin password' });

  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    if (!data[team]) return res.json({ success: false, message: 'Team not found' });

    if (action === 'reserve') data[team].status = 'reserved';
    else if (action === 'lock_admin') data[team].status = 'locked_admin';
    else if (action === 'free') {
      data[team].status = 'free';
      data[team].coach = '';
    } else return res.json({ success: false, message: 'Invalid action' });

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating teams file' });
  }
});

// ← شروع سرور (اصلاح‌شده)
app.listen(PORT, () => {
  console.log(Server running at http://localhost:${PORT});
});
