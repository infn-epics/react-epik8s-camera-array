import CameraTile from './CameraTile';

export default function CameraGrid({ rows, cols, cameras, client }) {
  const totalTiles = rows * cols;

  return (
    <div
      className="camera-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: totalTiles }, (_, i) => (
        <CameraTile
          key={i}
          cameras={cameras}
          client={client}
          initialCamera={cameras[i % cameras.length]}
        />
      ))}
    </div>
  );
}
