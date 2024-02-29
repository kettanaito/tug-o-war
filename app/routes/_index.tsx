import { useLoaderData } from "@remix-run/react";
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
  const response = await fetch(new URL("/parties/game/index", request.url));
  const { score } = await response.json();

  return {
    score,
  };
};

export default function Index() {
  const { score } = useLoaderData<typeof loader>();

  return (
    <div>
      <TugOWar initialScore={score} />
    </div>
  );
}
