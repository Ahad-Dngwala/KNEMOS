// generate-icons.js
// Run: node generate-icons.js
// Requires: npm install canvas
// Creates icons/ directory with 4 PNG sizes

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// Ensure icons dir exists
const iconsDir = path.join(__dirname, 'icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir)

function drawHexagon(ctx, cx, cy, r) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function createIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background — near black
  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, size, size)

  const cx = size / 2
  const cy = size / 2
  const hexR = size * 0.38

  // Hexagon glow (shadow layers)
  for (let i = 3; i >= 1; i--) {
    ctx.save()
    ctx.shadowColor = 'rgba(0, 200, 150, 0.25)'
    ctx.shadowBlur = size * 0.08 * i
    drawHexagon(ctx, cx, cy, hexR)
    ctx.strokeStyle = `rgba(0, 200, 150, ${0.08 * i})`
    ctx.lineWidth = size * 0.08
    ctx.stroke()
    ctx.restore()
  }

  // Hexagon stroke — teal
  drawHexagon(ctx, cx, cy, hexR)
  ctx.strokeStyle = '#00C896'
  ctx.lineWidth = Math.max(1, size * 0.05)
  ctx.shadowColor = 'rgba(0, 200, 150, 0.6)'
  ctx.shadowBlur = size * 0.06
  ctx.stroke()
  ctx.shadowBlur = 0

  // Letter "K"
  const fontSize = size * 0.38
  ctx.font = `700 ${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('K', cx, cy + fontSize * 0.05)

  // Save
  const outPath = path.join(iconsDir, `icon${size}.png`)
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'))
  console.log(`✓ Created icon${size}.png`)
}

;[16, 32, 48, 128].forEach(createIcon)
console.log('\nAll icons generated in ./icons/')
