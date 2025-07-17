import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Switch } from '../components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { toast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import QRCode from 'react-qr-code'
import QRCodeGenerator from '../components/QRCodeGenerator'
import CardExporter from '../components/CardExporter'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Share2, 
  Download, 
  Palette, 
  Type, 
  Image, 
  Plus, 
  Trash2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Briefcase,
  FileText,
  Smartphone,
  Monitor,
  Tablet,
  QrCode
} from 'lucide-react'

interface BusinessCard {
  id?: string
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
}

const themes = [
  { id: 'modern', name: 'Modern', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'minimal', name: 'Minimal', preview: '#ffffff' },
  { id: 'dark', name: 'Dark', preview: '#1f2937' },
  { id: 'gradient', name: 'Gradient', preview: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' },
  { id: 'professional', name: 'Professional', preview: '#f8fafc' }
]

const fonts = [
  { id: 'Inter', name: 'Inter' },
  { id: 'Roboto', name: 'Roboto' },
  { id: 'Open Sans', name: 'Open Sans' },
  { id: 'Lato', name: 'Lato' },
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Poppins', name: 'Poppins' }
]

export default function CardBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [showQRDialog, setShowQRDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const cardPreviewRef = useRef<HTMLDivElement>(null)

  const [cardData, setCardData] = useState<BusinessCard>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    bio: '',
    theme: 'modern',
    primaryColor: '#2563eb',
    secondaryColor: '#f59e0b',
    fontFamily: 'Inter',
    profileImageUrl: '',
    logoUrl: '',
    socialLinks: {},
    customFields: [],
    isActive: true
  })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (id && user) {
      loadCard(id)
    } else if (user) {
      setLoading(false)
    }
  }, [id, user])

  const loadCard = async (cardId: string) => {
    try {
      // Load from localStorage (in production, this would load from the database)
      const savedCard = localStorage.getItem(`card_${cardId}`)
      
      if (savedCard) {
        const parsedCard = JSON.parse(savedCard)
        
        // Parse JSON fields back to objects
        const loadedCard = {
          ...parsedCard,
          socialLinks: typeof parsedCard.socialLinks === 'string' 
            ? JSON.parse(parsedCard.socialLinks) 
            : parsedCard.socialLinks || {},
          customFields: typeof parsedCard.customFields === 'string' 
            ? JSON.parse(parsedCard.customFields) 
            : parsedCard.customFields || []
        }
        
        setCardData(loadedCard)
        
        toast({
          title: "Success",
          description: "Card loaded successfully!",
        })
      } else {
        toast({
          title: "Warning",
          description: "Card not found, creating new card",
          variant: "destructive"
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading card:', error)
      toast({
        title: "Error",
        description: "Failed to load card data",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const cardId = id || `card_${Date.now()}`
      const publicUrl = `${window.location.origin}/card/${cardId}`
      
      // Prepare data for storage
      const savedCard = {
        ...cardData,
        id: cardId,
        userId: user.id,
        publicUrl,
        socialLinks: JSON.stringify(cardData.socialLinks),
        customFields: JSON.stringify(cardData.customFields),
        updatedAt: new Date().toISOString()
      }
      
      // Save to localStorage for now (in production, this would use the database)
      localStorage.setItem(`card_${cardId}`, JSON.stringify(savedCard))
      
      // Also save to user's card list
      const userCards = JSON.parse(localStorage.getItem(`user_cards_${user.id}`) || '[]')
      const existingIndex = userCards.findIndex((card: any) => card.id === cardId)
      
      if (existingIndex >= 0) {
        userCards[existingIndex] = { 
          id: cardId, 
          name: cardData.name, 
          title: cardData.title,
          company: cardData.company,
          isActive: cardData.isActive,
          updatedAt: savedCard.updatedAt 
        }
      } else {
        userCards.push({ 
          id: cardId, 
          name: cardData.name, 
          title: cardData.title,
          company: cardData.company,
          isActive: cardData.isActive,
          updatedAt: savedCard.updatedAt 
        })
      }
      
      localStorage.setItem(`user_cards_${user.id}`, JSON.stringify(userCards))
      
      toast({
        title: "Success",
        description: "Card saved successfully!",
      })
      
      if (!id) {
        navigate(`/builder/${cardId}`)
      }
    } catch (error) {
      console.error('Error saving card:', error)
      toast({
        title: "Error",
        description: "Failed to save card",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'profile' | 'logo') => {
    try {
      const { publicUrl } = await blink.storage.upload(file, `cards/${type}/${file.name}`, { upsert: true })
      
      if (type === 'profile') {
        setCardData(prev => ({ ...prev, profileImageUrl: publicUrl }))
      } else {
        setCardData(prev => ({ ...prev, logoUrl: publicUrl }))
      }
      
      toast({
        title: "Success",
        description: `${type === 'profile' ? 'Profile image' : 'Logo'} uploaded successfully!`,
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
    }
  }

  const addCustomField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: '',
      value: '',
      type: 'text' as const
    }
    setCardData(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }))
  }

  const removeCustomField = (fieldId: string) => {
    setCardData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(field => field.id !== fieldId)
    }))
  }

  const updateCustomField = (fieldId: string, updates: Partial<typeof cardData.customFields[0]>) => {
    setCardData(prev => ({
      ...prev,
      customFields: prev.customFields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const getPublicUrl = () => {
    const cardId = id || `card_${Date.now()}`
    return `${window.location.origin}/card/${cardId}`
  }

  const getDevicePreviewClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-80 h-[600px]'
      case 'tablet':
        return 'w-96 h-[700px]'
      case 'desktop':
        return 'w-full h-[800px]'
      default:
        return 'w-80 h-[600px]'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please sign in to access the card builder.</p>
            <Button onClick={() => blink.auth.login()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">Card Builder</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate(`/card/${id || 'preview'}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Your Card</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <QRCode value={getPublicUrl()} size={200} />
                    </div>
                    <div>
                      <Label>Public URL</Label>
                      <div className="flex mt-1">
                        <Input value={getPublicUrl()} readOnly />
                        <Button 
                          variant="outline" 
                          className="ml-2"
                          onClick={() => navigator.clipboard.writeText(getPublicUrl())}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={cardData.title}
                          onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={cardData.company}
                        onChange={(e) => setCardData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={cardData.email}
                          onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={cardData.phone}
                          onChange={(e) => setCardData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={cardData.website}
                        onChange={(e) => setCardData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://johndoe.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={cardData.address}
                        onChange={(e) => setCardData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={cardData.bio}
                        onChange={(e) => setCardData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Brief description about yourself..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Profile Image</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        {cardData.profileImageUrl && (
                          <img 
                            src={cardData.profileImageUrl} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Profile Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'profile')
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Company Logo</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        {cardData.logoUrl && (
                          <img 
                            src={cardData.logoUrl} 
                            alt="Logo" 
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => logoInputRef.current?.click()}
                        >
                          Upload Logo
                        </Button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'logo')
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Theme & Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setCardData(prev => ({ ...prev, theme: theme.id }))}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              cardData.theme === theme.id 
                                ? 'border-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div 
                              className="w-full h-8 rounded mb-2"
                              style={{ background: theme.preview }}
                            />
                            <p className="text-sm font-medium">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={cardData.primaryColor}
                            onChange={(e) => setCardData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={cardData.primaryColor}
                            onChange={(e) => setCardData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            placeholder="#2563eb"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={cardData.secondaryColor}
                            onChange={(e) => setCardData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={cardData.secondaryColor}
                            onChange={(e) => setCardData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Type className="h-5 w-5 mr-2" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label>Font Family</Label>
                      <Select 
                        value={cardData.fontFamily} 
                        onValueChange={(value) => setCardData(prev => ({ ...prev, fontFamily: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map((font) => (
                            <SelectItem key={font.id} value={font.id}>
                              <span style={{ fontFamily: font.id }}>{font.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="instagram" className="flex items-center">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        value={cardData.socialLinks.instagram || ''}
                        onChange={(e) => setCardData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                        }))}
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin" className="flex items-center">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={cardData.socialLinks.linkedin || ''}
                        onChange={(e) => setCardData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                        }))}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter" className="flex items-center">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        value={cardData.socialLinks.twitter || ''}
                        onChange={(e) => setCardData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                        }))}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook" className="flex items-center">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        value={cardData.socialLinks.facebook || ''}
                        onChange={(e) => setCardData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                        }))}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Custom Fields
                      <Button size="sm" onClick={addCustomField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cardData.customFields.map((field) => (
                      <div key={field.id} className="flex items-end space-x-2">
                        <div className="flex-1">
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                            placeholder="Field name"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Value</Label>
                          <Input
                            value={field.value}
                            onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                            placeholder="Field value"
                          />
                        </div>
                        <div className="w-24">
                          <Label>Type</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(value: any) => updateCustomField(field.id, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeCustomField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {cardData.customFields.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No custom fields added yet. Click "Add Field" to create one.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Card Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your card publicly accessible
                        </p>
                      </div>
                      <Switch
                        checked={cardData.isActive}
                        onCheckedChange={(checked) => setCardData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Preview</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                      onClick={() => setPreviewDevice('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className={`${getDevicePreviewClass()} border rounded-lg overflow-hidden bg-white shadow-lg`}>
                    <div ref={cardPreviewRef}>
                      <CardPreview cardData={cardData} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <QRCodeGenerator 
              cardUrl={getPublicUrl()} 
              cardData={{
                name: cardData.name,
                title: cardData.title,
                company: cardData.company
              }}
            />

            <CardExporter 
              cardData={cardData}
              cardPreviewRef={cardPreviewRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Card Preview Component
function CardPreview({ cardData }: { cardData: BusinessCard }) {
  const getThemeStyles = () => {
    switch (cardData.theme) {
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
          background: cardData.primaryColor,
          color: '#ffffff'
        }
    }
  }

  const themeStyles = getThemeStyles()

  return (
    <div 
      className="w-full h-full p-6 overflow-y-auto"
      style={{ 
        ...themeStyles,
        fontFamily: cardData.fontFamily
      }}
    >
      <div className="text-center space-y-4">
        {/* Profile Image */}
        {cardData.profileImageUrl && (
          <div className="flex justify-center">
            <img 
              src={cardData.profileImageUrl} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
            />
          </div>
        )}

        {/* Name and Title */}
        <div>
          <h1 className="text-2xl font-bold">{cardData.name || 'Your Name'}</h1>
          {cardData.title && (
            <p className="text-lg opacity-90">{cardData.title}</p>
          )}
          {cardData.company && (
            <p className="text-base opacity-80">{cardData.company}</p>
          )}
        </div>

        {/* Bio */}
        {cardData.bio && (
          <p className="text-sm opacity-90 max-w-xs mx-auto">{cardData.bio}</p>
        )}

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {cardData.email && (
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{cardData.email}</span>
            </div>
          )}
          {cardData.phone && (
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{cardData.phone}</span>
            </div>
          )}
          {cardData.website && (
            <div className="flex items-center justify-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>{cardData.website}</span>
            </div>
          )}
          {cardData.address && (
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="text-center">{cardData.address}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {Object.values(cardData.socialLinks).some(link => link) && (
          <div className="flex justify-center space-x-4 pt-4">
            {cardData.socialLinks.instagram && (
              <Instagram className="h-6 w-6 opacity-80 hover:opacity-100 cursor-pointer" />
            )}
            {cardData.socialLinks.linkedin && (
              <Linkedin className="h-6 w-6 opacity-80 hover:opacity-100 cursor-pointer" />
            )}
            {cardData.socialLinks.twitter && (
              <Twitter className="h-6 w-6 opacity-80 hover:opacity-100 cursor-pointer" />
            )}
            {cardData.socialLinks.facebook && (
              <Facebook className="h-6 w-6 opacity-80 hover:opacity-100 cursor-pointer" />
            )}
          </div>
        )}

        {/* Custom Fields */}
        {cardData.customFields.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-white/20">
            {cardData.customFields.map((field) => (
              <div key={field.id} className="text-sm">
                <span className="font-medium">{field.label}: </span>
                <span className="opacity-90">{field.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Logo */}
        {cardData.logoUrl && (
          <div className="flex justify-center pt-4">
            <img 
              src={cardData.logoUrl} 
              alt="Logo" 
              className="h-12 object-contain opacity-80"
            />
          </div>
        )}
      </div>
    </div>
  )
}