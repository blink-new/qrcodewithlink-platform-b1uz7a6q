import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { toast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Download, 
  Share2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Building,
  User,
  ExternalLink,
  QrCode
} from 'lucide-react'

interface BusinessCard {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone: string
  website: string
  address: string
  bio: string
  theme: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  profileImageUrl: string
  logoUrl: string
  socialLinks: {
    instagram?: string
    linkedin?: string
    twitter?: string
    facebook?: string
    website?: string
  }
  customFields: Array<{
    id: string
    label: string
    value: string
    type: 'text' | 'url' | 'email' | 'phone'
  }>
  isActive: boolean
  publicUrl: string
  viewCount: number
}

export default function PublicCard() {
  const { id } = useParams()
  const [card, setCard] = useState<BusinessCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadCard(id)
      trackView(id)
    }
  }, [id])

  const loadCard = async (cardId: string) => {
    try {
      // For now, we'll load from localStorage since database isn't available
      // In production, this would load from the database
      const savedCard = localStorage.getItem(`card_${cardId}`)
      if (savedCard) {
        const cardData = JSON.parse(savedCard)
        setCard(cardData)
      } else {
        // Mock data for preview
        setCard({
          id: cardId,
          name: 'John Doe',
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          email: 'john@techcorp.com',
          phone: '+1 (555) 123-4567',
          website: 'https://johndoe.com',
          address: '123 Tech Street, San Francisco, CA 94105',
          bio: 'Passionate software engineer with 8+ years of experience building scalable web applications and leading development teams.',
          theme: 'modern',
          primaryColor: '#2563eb',
          secondaryColor: '#f59e0b',
          fontFamily: 'Inter',
          profileImageUrl: '',
          logoUrl: '',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/johndoe',
            twitter: 'https://twitter.com/johndoe',
            instagram: 'https://instagram.com/johndoe'
          },
          customFields: [
            { id: '1', label: 'GitHub', value: 'https://github.com/johndoe', type: 'url' },
            { id: '2', label: 'Portfolio', value: 'https://portfolio.johndoe.com', type: 'url' }
          ],
          isActive: true,
          publicUrl: `${window.location.origin}/card/${cardId}`,
          viewCount: 42
        })
      }
    } catch (error) {
      console.error('Error loading card:', error)
      setError('Failed to load business card')
    } finally {
      setLoading(false)
    }
  }

  const trackView = async (cardId: string) => {
    try {
      // In production, this would track the view in analytics
      console.log('Tracking view for card:', cardId)
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  const handleContactClick = (type: string, value: string) => {
    // Track click event
    console.log('Contact clicked:', type, value)
    
    switch (type) {
      case 'email':
        window.open(`mailto:${value}`)
        break
      case 'phone':
        window.open(`tel:${value}`)
        break
      case 'website':
      case 'url':
        window.open(value, '_blank')
        break
      default:
        break
    }
  }

  const handleShare = async () => {
    if (navigator.share && card) {
      try {
        await navigator.share({
          title: `${card.name} - Digital Business Card`,
          text: `Check out ${card.name}'s digital business card`,
          url: card.publicUrl
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(card.publicUrl)
        toast({
          title: "Link copied!",
          description: "The card link has been copied to your clipboard.",
        })
      }
    } else if (card) {
      navigator.clipboard.writeText(card.publicUrl)
      toast({
        title: "Link copied!",
        description: "The card link has been copied to your clipboard.",
      })
    }
  }

  const downloadVCard = () => {
    if (!card) return

    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
ORG:${card.company}
TITLE:${card.title}
EMAIL:${card.email}
TEL:${card.phone}
URL:${card.website}
ADR:;;${card.address};;;;
NOTE:${card.bio}
END:VCARD`

    const blob = new Blob([vCardData], { type: 'text/vcard' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${card.name.replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Contact downloaded!",
      description: "The contact has been saved to your device.",
    })
  }

  const getThemeStyles = () => {
    if (!card) return {}
    
    switch (card.theme) {
      case 'modern':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff'
        }
      case 'minimal':
        return {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb'
        }
      case 'dark':
        return {
          background: '#1f2937',
          color: '#ffffff'
        }
      case 'gradient':
        return {
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          color: '#ffffff'
        }
      case 'professional':
        return {
          background: '#f8fafc',
          color: '#334155',
          border: '1px solid #cbd5e1'
        }
      default:
        return {
          background: card.primaryColor,
          color: '#ffffff'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-12">
            <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Card Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This business card could not be found or is no longer available.'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Create Your Own Card
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!card.isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Card Unavailable</h2>
            <p className="text-muted-foreground mb-4">
              This business card is currently inactive.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Create Your Own Card
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const themeStyles = getThemeStyles()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <QrCode className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Digital Business Card</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={downloadVCard}>
                <Download className="h-4 w-4 mr-2" />
                Save Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden shadow-xl">
          <div 
            className="p-8 text-center"
            style={{ 
              ...themeStyles,
              fontFamily: card.fontFamily
            }}
          >
            {/* Profile Image */}
            {card.profileImageUrl && (
              <div className="flex justify-center mb-6">
                <img 
                  src={card.profileImageUrl} 
                  alt={card.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
                />
              </div>
            )}

            {/* Name and Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
              {card.title && (
                <p className="text-xl opacity-90 mb-1">{card.title}</p>
              )}
              {card.company && (
                <div className="flex items-center justify-center space-x-2 opacity-80">
                  <Building className="h-4 w-4" />
                  <span className="text-lg">{card.company}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {card.bio && (
              <p className="text-base opacity-90 max-w-md mx-auto mb-6 leading-relaxed">
                {card.bio}
              </p>
            )}

            {/* Contact Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {card.email && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleContactClick('email', card.email)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
              {card.phone && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleContactClick('phone', card.phone)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
              {card.website && (
                <Button
                  variant="secondary"
                  className="w-full sm:col-span-2"
                  onClick={() => handleContactClick('website', card.website)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm opacity-90 mb-6">
              {card.email && (
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{card.email}</span>
                </div>
              )}
              {card.phone && (
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{card.phone}</span>
                </div>
              )}
              {card.website && (
                <div className="flex items-center justify-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>{card.website}</span>
                </div>
              )}
              {card.address && (
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-center">{card.address}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {Object.values(card.socialLinks).some(link => link) && (
              <div className="flex justify-center space-x-4 mb-6">
                {card.socialLinks.instagram && (
                  <button
                    onClick={() => handleContactClick('url', card.socialLinks.instagram!)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                  </button>
                )}
                {card.socialLinks.linkedin && (
                  <button
                    onClick={() => handleContactClick('url', card.socialLinks.linkedin!)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                  </button>
                )}
                {card.socialLinks.twitter && (
                  <button
                    onClick={() => handleContactClick('url', card.socialLinks.twitter!)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Twitter className="h-6 w-6" />
                  </button>
                )}
                {card.socialLinks.facebook && (
                  <button
                    onClick={() => handleContactClick('url', card.socialLinks.facebook!)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}

            {/* Custom Fields */}
            {card.customFields.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-white/20">
                {card.customFields.map((field) => (
                  <div key={field.id} className="text-sm">
                    {field.type === 'url' ? (
                      <button
                        onClick={() => handleContactClick('url', field.value)}
                        className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="font-medium">{field.label}</span>
                      </button>
                    ) : field.type === 'email' ? (
                      <button
                        onClick={() => handleContactClick('email', field.value)}
                        className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">{field.label}</span>
                      </button>
                    ) : field.type === 'phone' ? (
                      <button
                        onClick={() => handleContactClick('phone', field.value)}
                        className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">{field.label}</span>
                      </button>
                    ) : (
                      <div>
                        <span className="font-medium">{field.label}: </span>
                        <span className="opacity-90">{field.value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Logo */}
            {card.logoUrl && (
              <div className="flex justify-center pt-6">
                <img 
                  src={card.logoUrl} 
                  alt="Company Logo" 
                  className="h-16 object-contain opacity-80"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Create your own digital business card
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  )
}