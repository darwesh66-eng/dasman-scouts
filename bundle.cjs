const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('❌ dist/index.html not found. Run "pnpm build" first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf-8');

// Find all CSS asset files
const cssMatches = [...html.matchAll(/href="([^"]*\.css)"/g)];
for (const m of cssMatches) {
  const relPath = m[1].replace(/^\//, '');
  const cssFile = path.join(distDir, relPath);
  if (fs.existsSync(cssFile)) {
    const css = fs.readFileSync(cssFile, 'utf-8');
    html = html.replace(
      new RegExp(`<link[^>]*href="${m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*\\/?>`, 'g'),
      `<style>${css}</style>`
    );
  }
}

// Find all JS module script files
const jsMatches = [...html.matchAll(/src="([^"]*\.js)"/g)];
for (const m of jsMatches) {
  const relPath = m[1].replace(/^\//, '');
  const jsFile = path.join(distDir, relPath);
  if (fs.existsSync(jsFile)) {
    const js = fs.readFileSync(jsFile, 'utf-8');
    html = html.replace(
      new RegExp(`<script[^>]*src="${m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*><\\/script>`, 'g'),
      `<script type="module">${js}</script>`
    );
  }
}

const outPath = path.join(__dirname, 'bundle.html');
fs.writeFileSync(outPath, html, 'utf-8');

const size = fs.statSync(outPath).size;
console.log(`✅ bundle.html created!`);
console.log(`📦 Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
console.log(`📍 Path: ${outPath}`);
