import { useState } from "react";
import usePartySocket from "partysocket/react";

export function TugOWar({ initialScore }: { initialScore: number }) {
  const [ropeProgress, setRopeProgress] = useState(initialScore);

  const socket = usePartySocket({
    party: "game",
    room: "index",
    onMessage(event) {
      const score = JSON.parse(event.data);
      console.log({ score });
      setRopeProgress(score);
    },
  });

  const addScore = (team: number) => {
    socket.send(JSON.stringify({ team }));
  };

  return (
    <div>
      <input
        name="rope"
        type="range"
        min={-100}
        max={100}
        step={10}
        value={ropeProgress}
      />
      <button className="h-32 w-32" onClick={() => addScore(1)}>
        Left
      </button>
      <button className="h-32 w-32" onClick={() => addScore(2)}>
        Right
      </button>
    </div>
  );
}
