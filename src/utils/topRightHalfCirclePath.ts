// SVG path for the top-right half of a circle: an arc across its NW–SE
// diameter, closed back along that diameter to fill just that half.
export function topRightHalfCirclePath(
  centerX: number,
  centerY: number,
  radius: number,
): string {
  const diagonalOffset = radius / Math.SQRT2;
  return `M ${centerX - diagonalOffset} ${centerY - diagonalOffset} A ${radius} ${radius} 0 0 1 ${centerX + diagonalOffset} ${centerY + diagonalOffset} Z`;
}
