/**
 * HelloWorld 网站 —— Node.js 原生 HTTP 服务器（零依赖，无需 npm install）
 *
 * 功能：
 *   1. GET /          返回首页（显示欢迎语）
 *   2. GET /api/time  返回服务器当前时间（JSON）
 *
 * 运行方式：
 *   node server.js    或    npm start
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1'; // 仅本机可访问；如需局域网访问，改为 '0.0.0.0'
const PORT = 3000;

// 获取服务器当前时间（使用服务器本机时区）
function getServerTime() {
  const now = new Date();
  return {
    serverTime: now.toLocaleString('zh-CN', { hour12: false }),
    isoTime: now.toISOString(),
    timestamp: now.getTime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 接口：返回服务器当前时间
  if (url.pathname === '/api/time') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(getServerTime()));
    return;
  }

  // 首页
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 内部错误：无法读取 index.html，请确认 public 目录存在。');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // 其他路径统一返回 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, HOST, () => {
  console.log('==========================================');
  console.log('  HelloWorld 网站已启动');
  console.log(`  请访问：http://${HOST}:${PORT}`);
  console.log(`  时间接口：http://${HOST}:${PORT}/api/time`);
  console.log('  按 Ctrl + C 停止服务器');
  console.log('==========================================');
});
