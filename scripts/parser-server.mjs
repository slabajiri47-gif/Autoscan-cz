import http from 'node:http'
import handler from '../api/parse-listing.ts'

const port = 8787
const server = http.createServer(async (request, response) => {
  if (request.url !== '/api/parse-listing') { response.writeHead(404, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ error: 'Nenalezeno.' })); return }
  let raw = ''
  for await (const chunk of request) raw += chunk
  let body = {}
  try { body = raw ? JSON.parse(raw) : {} } catch { body = {} }
  const adapter = {
    status(code) { response.statusCode = code; return adapter },
    setHeader(name, value) { response.setHeader(name, value) },
    json(value) { if (!response.headersSent) response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(value)) },
  }
  await handler({ method: request.method, body }, adapter)
})

server.listen(port, '127.0.0.1', () => console.log(`AutoScan parser běží na http://127.0.0.1:${port}`))
