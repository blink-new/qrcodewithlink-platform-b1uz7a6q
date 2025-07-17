import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { toast } from '../hooks/use-toast'
import QRCode from 'react-qr-code'
import { Download, Share2, Copy, Palette, Settings, Zap } from 'lucide-react'

interface QRCodeGeneratorProps {
  cardUrl: string
  cardData: {
    name: string
    title?: string
    company?: string
  }
}

interface QRCodeOptions {
  size: number
  bgColor: string
  fgColor: string
  level: 'L' | 'M' | 'Q' | 'H'
  includeMargin: boolean
  style: 'squares' | 'dots' | 'rounded'
}

export default function QRCodeGenerator({ cardUrl, cardData }: QRCodeGeneratorProps) {
  const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
    size: 256,
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    level: 'M',
    includeMargin: true,
    style: 'squares'
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQR = async (format: 'png' | 'svg' | 'pdf') => {
    try {
      const qrElement = qrRef.current?.querySelector('svg')
      if (!qrElement) {
        toast({
          title: "Error",
          description: "QR code not found",
          variant: "destructive"
        })
        return
      }

      if (format === 'svg') {
        // Download as SVG
        const svgData = new XMLSerializer().serializeToString(qrElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)
        
        const downloadLink = document.createElement('a')
        downloadLink.href = svgUrl
        downloadLink.download = `${cardData.name || 'business-card'}-qr.svg`
        downloadLink.click()
        
        URL.revokeObjectURL(svgUrl)
      } else if (format === 'png') {
        // Convert SVG to PNG using canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        const svgData = new XMLSerializer().serializeToString(qrElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        
        img.onload = () => {
          canvas.width = qrOptions.size
          canvas.height = qrOptions.size
          ctx?.drawImage(img, 0, 0)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob)
              const downloadLink = document.createElement('a')
              downloadLink.href = pngUrl
              downloadLink.download = `${cardData.name || 'business-card'}-qr.png`
              downloadLink.click()
              URL.revokeObjectURL(pngUrl)
            }
          })
          
          URL.revokeObjectURL(url)
        }
        
        img.src = url
      }

      toast({
        title: "Success",
        description: `QR code downloaded as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      toast({
        title: "Success",
        description: "Card URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      })
    }
  }

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardData.name}'s Digital Business Card`,
          text: `Check out ${cardData.name}${cardData.title ? `, ${cardData.title}` : ''}${cardData.company ? ` at ${cardData.company}` : ''}'s digital business card`,
          url: cardUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      copyToClipboard()
    }
  }

  const presetSizes = [
    { label: 'Small', value: 128 },
    { label: 'Medium', value: 256 },
    { label: 'Large', value: 512 },
    { label: 'Extra Large', value: 1024 }
  ]

  const errorLevels = [
    { label: 'Low (7%)', value: 'L' },
    { label: 'Medium (15%)', value: 'M' },
    { label: 'Quartile (25%)', value: 'Q' },
    { label: 'High (30%)', value: 'H' }
  ]

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              QR Code
            </CardTitle>
            <Badge variant="secondary">
              {qrOptions.level} Error Correction
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <div 
              ref={qrRef}
              className="p-4 rounded-lg border-2 border-dashed border-border"
              style={{ backgroundColor: qrOptions.bgColor }}
            >
              <QRCode
                value={cardUrl}
                size={qrOptions.size}
                bgColor={qrOptions.bgColor}
                fgColor={qrOptions.fgColor}
                level={qrOptions.level}
                includeMargin={qrOptions.includeMargin}
              />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Scan to view {cardData.name}'s digital business card
            </p>
            <div className="flex justify-center space-x-2">
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button size="sm" variant="outline" onClick={shareCard}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Customization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Customization
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Size Selection */}
          <div>
            <Label>Size</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {presetSizes.map((preset) => (
                <Button
                  key={preset.value}
                  size="sm"
                  variant={qrOptions.size === preset.value ? 'default' : 'outline'}
                  onClick={() => setQrOptions(prev => ({ ...prev, size: preset.value }))}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                type="number"
                value={qrOptions.size}
                onChange={(e) => setQrOptions(prev => ({ ...prev, size: parseInt(e.target.value) || 256 }))}
                min="64"
                max="2048"
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fgColor">Foreground Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="fgColor"
                  type="color"
                  value={qrOptions.fgColor}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, fgColor: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={qrOptions.fgColor}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, fgColor: e.target.value }))}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="bgColor"
                  type="color"
                  value={qrOptions.bgColor}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={qrOptions.bgColor}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, bgColor: e.target.value }))}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          {showAdvanced && (
            <>
              <Separator />
              
              {/* Error Correction Level */}
              <div>
                <Label>Error Correction Level</Label>
                <Select 
                  value={qrOptions.level} 
                  onValueChange={(value: any) => setQrOptions(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {errorLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher levels allow more damage but create denser codes
                </p>
              </div>

              {/* Include Margin */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Margin</Label>
                  <p className="text-xs text-muted-foreground">
                    Add quiet zone around QR code
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={qrOptions.includeMargin ? 'default' : 'outline'}
                  onClick={() => setQrOptions(prev => ({ ...prev, includeMargin: !prev.includeMargin }))}
                >
                  {qrOptions.includeMargin ? 'On' : 'Off'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Download Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Download Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => downloadQR('png')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">PNG</span>
              <span className="text-xs text-muted-foreground">Raster</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadQR('svg')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">SVG</span>
              <span className="text-xs text-muted-foreground">Vector</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Share2 className="h-5 w-5 mb-2" />
                  <span className="text-sm">Share</span>
                  <span className="text-xs text-muted-foreground">Social</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share QR Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ backgroundColor: qrOptions.bgColor }}
                    >
                      <QRCode
                        value={cardUrl}
                        size={200}
                        bgColor={qrOptions.bgColor}
                        fgColor={qrOptions.fgColor}
                        level={qrOptions.level}
                        includeMargin={qrOptions.includeMargin}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Share URL</Label>
                    <div className="flex mt-1">
                      <Input value={cardUrl} readOnly />
                      <Button 
                        variant="outline" 
                        className="ml-2"
                        onClick={copyToClipboard}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button onClick={shareCard}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Card
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Use SVG format for print materials and PNG for digital use. 
              Higher error correction levels work better for damaged or partially obscured codes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}