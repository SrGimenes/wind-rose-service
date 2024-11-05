import http from 'node:http'
import { json } from './middleware/json.js'
import { routes } from './routes.js'

const server = http.createServer(async (req, res) => {
  const { method, url } = req

  // Aplicar o middleware json
  await new Promise(resolve => json(req, res, resolve))

  const route = routes.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routeParams = req.url.match(route.path)
    const params = routeParams?.groups || {}
    req.params = params

    try {
      const result = await route.handler(req, res)
      if (!res.headersSent) {
        res.writeHead(result.statusCode, {
          'Content-Type': 'application/json',
          'X-Requested-With': 'for-CSRF-defense',
        })
        res.end(JSON.stringify(result.body))
      }
    } catch (error) {
      console.error('Erro no manipulador de rota:', error)
      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'X-Requested-With': 'for-CSRF-defense',
        })
        res.end(JSON.stringify({ error: 'Erro interno do servidor' }))
      }
    }
  } else {
    if (!res.headersSent) {
      res.writeHead(404, {
        'Content-Type': 'application/json',
        'X-Requested-With': 'for-CSRF-defense',
      })
      res.end(JSON.stringify({ error: 'Rota não encontrada' }))
    }
  }
})

server.listen(3333, () => {
  console.log('Servidor rodando na porta 3333')
})
