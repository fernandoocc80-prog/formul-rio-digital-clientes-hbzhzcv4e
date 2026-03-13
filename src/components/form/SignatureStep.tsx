import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eraser } from 'lucide-react'

interface Props {
  signature?: string
  onChange: (sig: string) => void
}

export function SignatureStep({ signature, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (signature && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
      img.src = signature
    }
  }, [signature]) // only try to load once when signature changes initially

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false)
      const ctx = canvasRef.current.getContext('2d')
      ctx?.beginPath()
      onChange(canvasRef.current.toDataURL())
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return
    e.preventDefault() // prevent scrolling while signing on mobile

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return
    }

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000'

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clear = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      onChange('')
    }
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-bold">Assinatura Digital</h2>
        <p className="text-muted-foreground">
          Assine no quadro abaixo para confirmar a veracidade das informações prestadas.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-input rounded-lg overflow-hidden bg-slate-50 touch-none relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={250}
              className="w-full h-[250px] cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              onTouchCancel={stopDrawing}
            />
            {!signature && !isDrawing && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <p className="text-muted-foreground/50 font-medium select-none">Assine aqui</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={clear}>
              <Eraser className="w-4 h-4 mr-2" /> Limpar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
