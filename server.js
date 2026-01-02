const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// دریافت وضعیت تیم‌ها
app.get('/api/teams', (req, res) => {
  fs.readFile('teams.json', 'utf8', (err, data) => {
    if (err) return res.json({});
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json({});
    }
  });
});

// انتخاب تیم توسط مربی
app.post('/api/choose', (req, res) => {
  const { team, coachName, label } = req.body;
  if (!team || !coachName || !label) return res.status(400).send('Invalid data');

  fs.readFile('teams.json', 'utf8', (err, data) => {
    let teams = {};
    if (!err) {
      try { teams = JSON.parse(data); } catch {}
    }
    if (!teams[team]) {
      teams[team] = { coachName, label };
      fs.writeFile('teams.json', JSON.stringify(teams, null, 2), () => {
        res.json({ success: true });
      });
    } else {
      res.json({ success: false, message: 'تیم قبلا انتخاب شده' });
    }
  });
});

// پنل ادمین: آزاد کردن یا رزرو تیم
app.post('/api/admin', (req, res) => {
  const { team, action, name } = req.body;
  if (!team || !action) return res.status(400).send('Invalid data');

  fs.readFile('teams.json', 'utf8', (err, data) => {
    let teams = {};
    if (!err) {
      try { teams = JSON.parse(data); } catch {}
    }

    if (action === 'unlock') {
      delete teams[team];
    } else if (action === 'reserve') {
      teams[team] = { coachName: '', label: 'رزرو شده', name: name || '' };
    }
    fs.writeFile('teams.json', JSON.stringify(teams, null, 2), () => {
      res.json({ success: true });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
