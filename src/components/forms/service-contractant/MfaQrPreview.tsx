interface MfaQrPreviewProps {
  seed: string;
}

const GRID_SIZE = 21;

function hashSeed(seed: string): number {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

export default function MfaQrPreview({ seed }: MfaQrPreviewProps) {
  const baseHash = hashSeed(seed || "fallback");

  return (
    <div className="w-32 h-32 rounded-lg bg-white border border-gray-300 p-2 shadow-sm">
      <div
        className="grid w-full h-full"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;

          const finderTopLeft = row < 7 && col < 7;
          const finderTopRight = row < 7 && col > GRID_SIZE - 8;
          const finderBottomLeft = row > GRID_SIZE - 8 && col < 7;

          const inFinder = finderTopLeft || finderTopRight || finderBottomLeft;
          const inFinderCore =
            (finderTopLeft && row > 1 && row < 5 && col > 1 && col < 5) ||
            (finderTopRight &&
              row > 1 &&
              row < 5 &&
              col > GRID_SIZE - 6 &&
              col < GRID_SIZE - 2) ||
            (finderBottomLeft &&
              row > GRID_SIZE - 6 &&
              row < GRID_SIZE - 2 &&
              col > 1 &&
              col < 5);

          const isFinderPixel =
            inFinder &&
            (row === 0 || col === 0 || row === 6 || col === 6 || inFinderCore);

          const randomBit =
            (baseHash + row * 31 + col * 17 + row * col) % 7 < 3;
          const isDark = isFinderPixel || (!inFinder && randomBit);

          return (
            <span
              key={index}
              className={isDark ? "bg-[#364150]" : "bg-white"}
            />
          );
        })}
      </div>
    </div>
  );
}
