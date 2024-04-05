import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from '@remix-run/react'
import styles from './tailwind.css'

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Tug-o-War - Remix and MSW demo',
    },
    {
      name: 'description',
      content: 'A tug-o-war game with Remix and MSW',
    },
  ]
}

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        {
          rel: 'stylesheet',
          href: cssBundleHref,
        },
      ]
    : []),
  {
    rel: 'stylesheet',
    href: styles,
  },
]

export async function loader() {
  return json({
    ENV: {
      USE_MOCKS: process.env.USE_MOCKS,
    },
  })
}

export default function App() {
  const { ENV } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1, user-scalable=no"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
