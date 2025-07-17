import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { toast } from '../hooks/use-toast'
import { Download, FileImage, FileText, Share2, Printer } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface CardExporterProps {
  cardData: any
  cardPreviewRef: React.RefObject<HTMLDivElement>
}

export default function CardExporter({ cardData, cardPreviewRef }: CardExporterProps) {
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'jpeg'>('png')

  const exportCard = async (format: 'png' | 'pdf' | 'jpeg') => {
    if (!cardPreviewRef.current) {
      toast({
        title: "Error",
        description: "Card preview not found",
        variant: "destructive"
      })
      return
    }

    setExporting(true)
    try {
      const canvas = await html2canvas(cardPreviewRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      })

      if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [85.6, 53.98] // Standard business card size
        })
        
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98)
        pdf.save(`${cardData.name || 'business-card'}.pdf`)
      } else {
        // PNG or JPEG
        const link = document.createElement('a')
        link.download = `${cardData.name || 'business-card'}.${format}`
        link.href = canvas.toDataURL(`image/${format}`, 0.9)
        link.click()
      }

      toast({
        title: "Success",
        description: `Card exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error exporting card:', error)
      toast({
        title: "Error",
        description: "Failed to export card",
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const printCard = () => {
    if (!cardPreviewRef.current) {
      toast({
        title: "Error",
        description: "Card preview not found",
        variant: "destructive"
      })
      return
    }

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const cardHtml = cardPreviewRef.current.outerHTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Business Card</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: ${cardData.fontFamily || 'Inter'}, sans-serif;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .card { 
                  width: 85.6mm; 
                  height: 53.98mm; 
                  page-break-after: always;
                }
              }
            </style>
          </head>
          <body>
            <div class="card">${cardHtml}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const shareCard = async () => {
    if (!cardPreviewRef.current) return

    try {
      const canvas = await html2canvas(cardPreviewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          try {
            const file = new File([blob], `${cardData.name || 'business-card'}.png`, {
              type: 'image/png'
            })

            await navigator.share({
              title: `${cardData.name}'s Business Card`,
              text: `Check out ${cardData.name}'s digital business card`,
              files: [file]
            })
          } catch (error) {
            // Fallback to download if sharing fails
            const link = document.createElement('a')
            link.download = `${cardData.name || 'business-card'}.png`
            link.href = URL.createObjectURL(blob)
            link.click()
          }
        } else {
          // Fallback to download
          const link = document.createElement('a')
          link.download = `${cardData.name || 'business-card'}.png`
          link.href = URL.createObjectURL(blob!)
          link.click()
        }
      })
    } catch (error) {
      console.error('Error sharing card:', error)
      toast({
        title: "Error",
        description: "Failed to share card",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            variant="outline" 
            onClick={() => exportCard('png')}
            disabled={exporting}
            className="flex flex-col items-center p-4 h-auto"
          >
            <FileImage className="h-5 w-5 mb-2" />
            <span className="text-sm">PNG</span>
            <span className="text-xs text-muted-foreground">High Quality</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => exportCard('pdf')}
            disabled={exporting}
            className="flex flex-col items-center p-4 h-auto"
          >
            <FileText className="h-5 w-5 mb-2" />
            <span className="text-sm">PDF</span>
            <span className="text-xs text-muted-foreground">Print Ready</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={printCard}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Printer className="h-5 w-5 mb-2" />
            <span className="text-sm">Print</span>
            <span className="text-xs text-muted-foreground">Direct</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareCard}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Share2 className="h-5 w-5 mb-2" />
            <span className="text-sm">Share</span>
            <span className="text-xs text-muted-foreground">Social</span>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Standard business card size:</span>
            <Badge variant="secondary">85.6 × 53.98 mm</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Export quality:</span>
            <Badge variant="secondary">300 DPI</Badge>
          </div>
        </div>

        {exporting && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Exporting card...</span>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Use PDF for professional printing and PNG for digital sharing. 
            The print option opens a print-optimized view.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}