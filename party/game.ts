import type * as Party from "partykit/server";

export default class GameServer implements Party.Server {
  static options = {
    hibernate: true,
  };

  score = 0;

  constructor(private readonly room: Party.Room) {}

  async onStart() {
    this.score = (await this.room.storage.get("score")) ?? 0;
  }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    connection.send(this.score.toString());
  }

  onRequest(request: Party.Request): Response | Promise<Response> {
    if (request.method === "GET") {
      return Response.json({ score: this.score });
    }

    return new Response(null, { status: 405 });
  }

  onMessage(message: string, sender: Party.Connection<unknown>) {
    const data = JSON.parse(message);
    console.log({ data });

    if (data.team) {
      const scoreDelta = data.team === 1 ? -10 : 10;
      this.score = this.score + scoreDelta;
      this.room.broadcast(this.score.toString());
      this.room.storage.put("score", this.score);
    }
  }
}

GameServer satisfies Party.Worker;
