import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

declare global {
  interface Window {
    ENV: {
      USE_MOCKS?: string
    }
  }
}

async function prepareApp() {
  if (window.ENV.USE_MOCKS === '1') {
    const { worker } = await import('./mocks/browser.js')

    await worker.start({
      onUnhandledRequest(request, print) {
        const url = new URL(request.url)
        if (/\.(css|js|json|png|jpg|gif)$/.test(url.pathname)) {
          return
        }

        print.warning()
      },
    })
  }
}

prepareApp().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    )
  })
})
