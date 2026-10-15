/**
 * HelloWorld 网站 —— Node.js 原生 HTTP 服务器（零依赖，无需 npm install）
 *
 * 双模式运行：
 *   1. 本地运行：  node server.js  或  npm start
 *      -> 启动 HTTP 服务监听 127.0.0.1:3000
 *   2. Vercel 部署：
 *      -> 本文件导出请求处理函数（module.exports），由 Vercel 无服务器运行时调用
 *      -> 配合根目录 vercel.json 使用
 *
 * 功能：
 *   1. GET /          返回首页（显示欢迎语）
 *   2. GET /api/time  返回服务器当前时间（JSON）
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1'; // 仅本地运行使用；Vercel 部署时该值不参与
const PORT = process.env.PORT || 3000;

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

// 统一的请求处理函数（本地与 Vercel 共用）
function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

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
}

// Vercel 无服务器函数入口：导出请求处理函数
module.exports = handleRequest;

// 本地运行入口：仅当直接执行 node server.js 时才启动 HTTP 服务
if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log('==========================================');
    console.log('  HelloWorld 网站已启动（本地模式）');
    console.log(`  请访问：http://${HOST}:${PORT}`);
    console.log(`  时间接口：http://${HOST}:${PORT}/api/time`);
    console.log('  按 Ctrl + C 停止服务器');
    console.log('==========================================');
  });
}
