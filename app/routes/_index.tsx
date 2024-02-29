import type {
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "partymix";
import WhosHere from "../components/whos-here";

declare const PARTYKIT_HOST: string;

export const meta: MetaFunction = () => {
  return [
    { title: "Tug-o-War" },
    {
      name: "description",
      content: "Realtime game of tug-o-war with Remix, PartyKit, and MSW",
    },
  ];
};

export const loader: LoaderFunction = async function ({
  context,
}: LoaderFunctionArgs) {
  // You can use context.lobby to read vars, communicate with parties,
  // read from ai models or the vector db, and more.
  //
  // See https://docs.partykit.io/reference/partyserver-api/#partyfetchlobby
  // for more info.
  return Response.json({ partykitHost: PARTYKIT_HOST });
};

export default function Index() {
  return (
    <div>
      <h1>🎈 PartyKit ⤫ Remix 💿 </h1>
      <WhosHere />
    </div>
  );
}
