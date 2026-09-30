import { getAccentColor } from '@actual-app/components/category-tile';

type CategoryAccentDotProps = {
  accentIndex: number | undefined;
};

/**
 * The register's category dot (design-decisions §10): the same accent as
 * the category's budget tile. Decorative; the category name is beside it.
 */
export function CategoryAccentDot({ accentIndex }: CategoryAccentDotProps) {
  if (accentIndex === undefined) {
    return null;
  }
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        flexShrink: 0,
        marginRight: 8,
        borderRadius: 99,
        backgroundColor: getAccentColor(accentIndex),
      }}
    />
  );
}
