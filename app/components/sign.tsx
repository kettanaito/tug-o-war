export function Sign({
  children,
  reversed,
}: {
  children: React.ReactNode
  reversed?: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'url(/assets/sign.png) bottom left no-repeat',
        backgroundSize: 'contain',
        height: 'auto',
        width: '100%',
        aspectRatio: '1.219 / 1',
        maxWidth: '100%',
        color: '#0B0B0B',
        ...(reversed ? { transform: 'scaleX(-1)' } : {}),
      }}
    >
      <p
        style={{
          position: 'absolute',
          top: '48%',
          left: '55%',
          margin: 0,
          transform: `translate(-50%, -50%) rotate(-12deg) ${
            reversed ? 'scaleX(-1)' : ''
          }`,
          textShadow: '0 0.25vw 0 rgba(255,255,255,0.25)',
        }}
      >
        {children}
      </p>
    </div>
  )
}
