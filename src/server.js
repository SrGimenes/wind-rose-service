import http, { createServer } from "node:http";
import { json } from "./middleware/json.js";
import { routes } from "./routes.js";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  await json(req, res)

  const route = routes.find((route) => {
    return route.method === method && route.path.test(url)
  })

  if (route) {

    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    req.params = params;
    req.query = query ? extractQueryParams(query) : {};

    console.log(routeParams)

    return route.handler(req, res);
  }

  return res.writeHead(404).end();

  console.log('Server is running')
})

server.listen(3333)