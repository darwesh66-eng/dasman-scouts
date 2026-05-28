// SVG placeholder logo — replace with base64 PNG of the real logo if desired.
// Arabic: مجموعة دسمان الكشفية | English: DASMAN SCOUT GROUP
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="195" fill="#FFFFFF" stroke="#1B3A6B" stroke-width="7"/>
  <circle cx="200" cy="200" r="172" fill="none" stroke="#1B3A6B" stroke-width="2" stroke-dasharray="8 5"/>
  <circle cx="200" cy="200" r="148" fill="#EEF4FB" stroke="#1B3A6B" stroke-width="2"/>
  <text x="200" y="245" text-anchor="middle" font-size="88" fill="#1B3A6B" font-family="serif">&#x269C;</text>
  <text x="200" y="112" text-anchor="middle" font-size="23" fill="#1B3A6B" font-family="Arial,sans-serif" font-weight="bold">&#x645;&#x62C;&#x645;&#x648;&#x639;&#x629; &#x62F;&#x633;&#x645;&#x627;&#x646; &#x627;&#x644;&#x643;&#x634;&#x641;&#x64A;&#x629;</text>
  <line x1="58" y1="128" x2="105" y2="128" stroke="#1B3A6B" stroke-width="1.5"/>
  <line x1="295" y1="128" x2="342" y2="128" stroke="#1B3A6B" stroke-width="1.5"/>
  <text x="200" y="322" text-anchor="middle" font-size="15" fill="#1B3A6B" font-family="Arial,sans-serif" letter-spacing="2" font-weight="600">DASMAN SCOUT GROUP</text>
  <circle cx="72" cy="218" r="26" fill="none" stroke="#1B3A6B" stroke-width="2"/>
  <ellipse cx="72" cy="218" rx="13" ry="26" fill="none" stroke="#1B3A6B" stroke-width="1.5"/>
  <line x1="46" y1="218" x2="98" y2="218" stroke="#1B3A6B" stroke-width="1.5"/>
  <line x1="46" y1="207" x2="98" y2="207" stroke="#1B3A6B" stroke-width="1" stroke-dasharray="3 2"/>
  <line x1="46" y1="229" x2="98" y2="229" stroke="#1B3A6B" stroke-width="1" stroke-dasharray="3 2"/>
  <circle cx="328" cy="218" r="26" fill="none" stroke="#1B3A6B" stroke-width="2"/>
  <ellipse cx="328" cy="218" rx="13" ry="26" fill="none" stroke="#1B3A6B" stroke-width="1.5"/>
  <line x1="302" y1="218" x2="354" y2="218" stroke="#1B3A6B" stroke-width="1.5"/>
  <line x1="302" y1="207" x2="354" y2="207" stroke="#1B3A6B" stroke-width="1" stroke-dasharray="3 2"/>
  <line x1="302" y1="229" x2="354" y2="229" stroke="#1B3A6B" stroke-width="1" stroke-dasharray="3 2"/>
</svg>`;

export const LOGO_DATA = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
