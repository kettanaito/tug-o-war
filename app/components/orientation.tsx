export function Orientation() {
  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        zIndex: '10',
        textAlign: 'center',
      }}
    >
      <div style={{ padding: '5vw' }}>
        <img
          src="/landscape-mode.svg"
          style={{
            display: 'flex',
            width: '32vw',
            maxWidth: '80%',
            margin: 'auto',
            opacity: 0.5,
          }}
        />
        <h2>Landscape mode</h2>
        <p>Please turn your device to a landscape mode. Thank you!</p>
      </div>
    </aside>
  )
}
