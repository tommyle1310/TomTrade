type RoundedTopRectPathParams = {
  x: number;        // center x
  bottomY: number;  // y đáy (ví dụ: chartHeight)
  width: number;    // barWidth
  height: number;   // chiều cao bar
  radius?: number;  // bán kính bo (optional)
};

export function roundedTopRectPath({
  x,
  bottomY,
  width,
  height,
  radius,
}: RoundedTopRectPathParams): string {
  const halfW = width / 2;
  const r = Math.min(radius ?? halfW, halfW, height);

  const left = x - halfW;
  const right = x + halfW;
  const top = bottomY - height;

  return `
    M ${left}, ${bottomY}
    V ${top + r}
    Q ${left}, ${top} ${left + r}, ${top}
    H ${right - r}
    Q ${right}, ${top} ${right}, ${top + r}
    V ${bottomY}
    Z
  `;
}
