import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

async function prepareApp() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser.js')

    //   await worker.start({
    //     onUnhandledRequest(request, print) {
    //       if (/\.(css|js|json|png|jpg|gif)$/.test(request.url)) {
    //         return
    //       }

    //       print.warning()
    //     },
    //   })
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
