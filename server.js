const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// خواندن رمز ادمین از متغیر محیطی
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mtfootball-admin";

app.use(express.json());
app.use(express.static('public'));

const dataFile = './teams.json';

// گرفتن لیست تیم‌ها
app.get('/teams', (req, res) => {
  const data = fs.readFileSync(dataFile);
  res.json(JSON.parse(data));
});

// انتخاب تیم توسط بازیکن
app.post('/select', (req, res) => {
  const { team, coach } = req.body;
  const data = JSON.parse(fs.readFileSync(dataFile));

  if (!data[team]) {
    return res.json({ success: false, message: 'Team not found' });
  }

  if (data[team].status !== 'free') {
    return res.json({ success: false, message: 'Team already taken' });
  }

  data[team].status = 'taken';
  data[team].coach = coach;

  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// عملیات ادمین (رزرو / قفل / آزاد کردن تیم)
app.post('/admin', (req, res) => {
  const { team, action, password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.json({ success: false, message: 'Wrong admin password' });
  }

  const data = JSON.parse(fs.readFileSync(dataFile));

  if (!data[team]) {
    return res.json({ success: false, message: 'Team not found' });
  }

  if (action === 'reserve') data[team].status = 'reserved';
  else if (action === 'lock_admin') data[team].status = 'locked_admin';
  else if (action === 'free') {
    data[team].status = 'free';
    data[team].coach = '';
  }
  else return res.json({ success: false, message: 'Invalid action' });

  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(Server running at http://localhost:${PORT});
});
