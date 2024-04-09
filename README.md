![Tug-o-war game in action](/screenshot.png)

<h1 align="center">Tug-o-War Game</h1>

A tug-o-war game with Remix, WebSockets, and MSW. Help the stubborn dwarves settle one of the most important questions of humankind: _Tabs_ or _Spaces_? And, well, learn about the WebSocket mocking with MSW while you're at it!

👉 [**Play the live game**](https://tug-o-war-express.fly.dev/) 👈

> If you are reading this after EpicWeb Conf 2024, launch the game in [Admin mode](https://tug-o-war-express.fly.dev/?admin=true) and click "Start game" in order to play.

## Key points

- [`/server`](./server) for the production WebSocket server and the game logic.
- [`/app/mocks/handlers.ts`](./app/mocks//handlers.ts) for the WebSocket event handlers with MSW.
- [`/app/components/tug-o-war.test.tsx`](./app/components//tug-o-war.test.tsx) for integration tests with Vitest and MSW. Note that the integration tests run in a special environment ([`/test/environments/vitest-environment-node-websocket`](./test/environments//vitest-environment-node-websocket.ts) that exposes the `WebSocket` constructor globally in Node.js).
- [`/app/entry.client.tsx`](./app/entry.client.tsx) for browser integration of MSW.

## Local development

```sh
npm install
npm run dev
```

For build and preview:

```sh
npm run build
npm start
```
