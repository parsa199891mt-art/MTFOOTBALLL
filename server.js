const express = require('express');
const app = express();
const port = 3000;

// پوشه public شامل فایل‌های سایت
app.use(express.static('public'));

// شروع سرور
app.listen(port, () => {
  console.log(`Server running at ;http://localhost:${port}`)
});