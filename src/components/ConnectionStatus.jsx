export default function ConnectionStatus({ connected }) {
  return (
    <span className={`conn-status ${connected ? 'connected' : 'disconnected'}`}>
      {connected ? '● PVWS Connected' : '○ PVWS Disconnected'}
    </span>
  );
}
