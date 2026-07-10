export default function Icon({
  id,
  size,
  style,
}: {
  id: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className="ic"
      style={size ? { width: size, height: size, ...style } : style}
      aria-hidden="true"
    >
      <use href={`#${id}`} />
    </svg>
  );
}
