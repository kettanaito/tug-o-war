import * as fs from 'node:fs'
import * as http from 'node:http'
import express from 'express'
import { WebSocketServer } from 'ws'
import compression from 'compression'
import morgan from 'morgan'
import { createRequestHandler, type RequestHandler } from '@remix-run/express'
import { broadcastDevReady, installGlobals, ServerBuild } from '@remix-run/node'
import sourceMapSupport from 'source-map-support'
import { Game } from './Game.js'

// patch in Remix runtime globals
installGlobals()
sourceMapSupport.install()

const BUILD_PATH = process.env.BUILD_PATH || '../build/index.js'
const WATCH_PATH = process.env.WATCH_PATH || '../build/version.txt'

// Initial build.
let build: ServerBuild = await import(BUILD_PATH)

// We'll make chokidar a dev dependency so it doesn't get bundled in production.
const chokidar =
  process.env.NODE_ENV === 'development' ? await import('chokidar') : null

const app = express()
const server = http.createServer(app)

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', { immutable: true, maxAge: '1y' }),
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }))
app.use(morgan('tiny'))

// Create a request handler that watches for changes to the server build during development.
function createDevRequestHandler(): RequestHandler {
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer()

    // Add debugger to assist in v2 dev debugging
    if (build?.assets === undefined) {
      console.log(build.assets)
      debugger
    }

    // 2. tell dev server that this app server is now up-to-date and ready
    await broadcastDevReady(build)
  }

  chokidar
    ?.watch(WATCH_PATH, { ignoreInitial: true })
    .on('add', handleServerUpdate)
    .on('change', handleServerUpdate)

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: 'development',
      })(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// ESM import cache busting
async function reimportServer(): Promise<ServerBuild> {
  const stat = fs.statSync(BUILD_PATH)

  // use a timestamp query parameter to bust the import cache
  return import(BUILD_PATH + '?t=' + stat.mtimeMs)
}

app.get('/state', (req, res) => {
  res.json(game.getState())
})

const wss = new WebSocketServer({ server })
const game = new Game(wss)

// Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase.
app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
      }),
)

const port = process.env.PORT || 3000
server.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`)

  // send "ready" message to dev server
  if (process.env.NODE_ENV === 'development') {
    await broadcastDevReady(build)
  }
})
