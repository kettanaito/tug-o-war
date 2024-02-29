import { json, useLoaderData } from "@remix-run/react";
import type {
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "partymix";
import { TugOWar } from "~/components/tug-o-war";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Tug-o-War",
    },
    {
      name: "description",
      content: "Realtime game of tug-o-war with Remix, PartyKit, and MSW",
    },
  ];
};

export const loader: LoaderFunction = async function ({
  request,
}: LoaderFunctionArgs) {
  // Fetch the current score of the game on initial load
  // and pass it to the client component as the initial state.
  const url = new URL("/parties/game/index", request.url);
  const score = await fetch(url)
    .then((response) => response.json())
    .then((data) => data.score)
    .catch(() => -1);

  return json({
    score,
  });
};

export default function Index() {
  const { score } = useLoaderData<typeof loader>();

  console.log({ score });

  return (
    <div>
      <TugOWar initialScore={score} />
    </div>
  );
}
