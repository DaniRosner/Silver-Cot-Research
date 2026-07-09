export async function downloadChartAsPNG(elementId, filename = 'chart.png') {
  const el = document.getElementById(elementId)
  if (!el) return

  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(el, {
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-secondary').trim() || '#161b22',
    scale: 2,
    useCORS: true,
    logging: false,
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function downloadChartAsSVG(svgElement, filename = 'chart.svg') {
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgElement)
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
