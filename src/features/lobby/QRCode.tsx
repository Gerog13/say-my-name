import { useEffect, useState } from 'react'
import QR from 'qrcode'

export function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QR.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: '#0a0a0f', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => setDataUrl(null))
    return () => {
      active = false
    }
  }, [value, size])

  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-white p-2"
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <img src={dataUrl} alt="QR para unirse" className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-pulse rounded bg-white/40" />
      )}
    </div>
  )
}
