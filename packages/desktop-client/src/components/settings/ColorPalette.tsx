import { View } from '@actual-app/components/view';

const DEFAULT_COLORS = ['#ccc', '#999', '#666', '#333', '#111', '#000'];

type ColorPaletteProps = {
  colors?: string[];
  radius?: number;
};

export function ColorPalette({ colors, radius = 4 }: ColorPaletteProps) {
  // Default fallback colors if not provided
  const paletteColors = colors ?? DEFAULT_COLORS;

  return (
    <View
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        width: '100%',
        flex: 1,
        minHeight: 0,
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      {paletteColors.slice(0, 6).map((color, i) => (
        <div key={i} data-swatch style={{ backgroundColor: color }} />
      ))}
    </View>
  );
}
