// mock-server.js — KnemOS Mock Backend for Extension Testing
// Run: node mock-server.js
// Listens on http://127.0.0.1:8765 and logs incoming tab data

const http = require('http')

const PORT = 8765
let requestCount = 0

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Health endpoint
  if (req.method === 'GET' && req.url === '/api/system/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', version: '1.0.0' }))
    console.log('  [health] GET /api/system/health → 200')
    return
  }

  // Browser tabs endpoint
  if (req.method === 'POST' && req.url === '/api/system/browser-tabs') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        const tabs = data.tabs || []
        requestCount++

        console.log(`\n[Request #${requestCount}] POST /api/system/browser-tabs`)
        console.log(`  Received: ${tabs.length} tabs`)
        if (tabs.length > 0) {
          tabs.forEach((tab, i) => {
            const url = tab.url.length > 60 ? tab.url.slice(0, 60) + '...' : tab.url
            console.log(`  ${i + 1}. [${tab.active ? 'ACTIVE' : '      '}] ${tab.title}`)
            console.log(`           ${url}`)
          })
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', received: tabs.length }))
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }))
      }
    })
    return
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'not found' }))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('╔══════════════════════════════════════╗')
  console.log('║   KnemOS Mock Backend — Running      ║')
  console.log(`║   http://127.0.0.1:${PORT}             ║`)
  console.log('╚══════════════════════════════════════╝')
  console.log('')
  console.log('Waiting for extension to send tab data...')
  console.log('(Load the extension in Chrome, then open some tabs)')
  console.log('')
})
