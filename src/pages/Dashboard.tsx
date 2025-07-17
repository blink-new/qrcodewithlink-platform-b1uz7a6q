import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  QrCode, 
  Eye, 
  MousePointer, 
  Share2, 
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { blink } from '../blink/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

interface BusinessCard {
  id: string
  name: string
  title: string
  company: string
  theme: string
  views: number
  clicks: number
  createdAt: string
  isActive: boolean
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadCards()
    }
  }, [user, loadCards])

  const loadCards = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // For now, load from localStorage since database isn't available
      // In production, this would load from the database
      const savedCards = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('card_')) {
          try {
            const cardData = JSON.parse(localStorage.getItem(key) || '{}')
            if (cardData.userId === user.id) {
              savedCards.push({
                id: cardData.id,
                name: cardData.name || 'Untitled Card',
                title: cardData.title || '',
                company: cardData.company || '',
                theme: cardData.theme || 'modern',
                views: Math.floor(Math.random() * 100), // Mock data
                clicks: Math.floor(Math.random() * 50), // Mock data
                createdAt: cardData.updatedAt || new Date().toISOString(),
                isActive: cardData.isActive !== false
              })
            }
          } catch (e) {
            console.error('Error parsing card data:', e)
          }
        }
      }
      setCards(savedCards)
    } catch (error) {
      console.error('Error loading cards:', error)
    }
  }, [user?.id])

  const handleSignOut = () => {
    blink.auth.logout()
    navigate('/')
  }

  const copyCardLink = (cardId: string) => {
    const link = `${window.location.origin}/card/${cardId}`
    navigator.clipboard.writeText(link)
    // You could add a toast notification here
  }

  const deleteCard = async (cardId: string) => {
    try {
      // For now, delete from localStorage since database isn't available
      // In production, this would delete from the database
      localStorage.removeItem(`card_${cardId}`)
      setCards(cards.filter(card => card.id !== cardId))
    } catch (error) {
      console.error('Error deleting card:', error)
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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Welcome to QRCard</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Please sign in to access your dashboard and create digital business cards.
            </p>
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalViews = cards.reduce((sum, card) => sum + card.views, 0)
  const totalClicks = cards.reduce((sum, card) => sum + card.clicks, 0)
  const activeCards = cards.filter(card => card.isActive).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">QRCard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/analytics')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Manage your digital business cards and track their performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                  <p className="text-2xl font-bold text-foreground">{cards.length}</p>
                </div>
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Cards</p>
                  <p className="text-2xl font-bold text-foreground">{activeCards}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
                </div>
                <MousePointer className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Business Cards</h2>
          <Button onClick={() => navigate('/builder')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No cards yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first digital business card to get started with professional networking.
              </p>
              <Button onClick={() => navigate('/builder')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-sm text-muted-foreground">{card.company}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/builder/${card.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyCardLink(card.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/card/${card.id}`)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          View Public
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteCard(card.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={card.isActive ? 'default' : 'secondary'}>
                      {card.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{card.theme}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>{card.views} views</span>
                    </div>
                    <div className="flex items-center">
                      <MousePointer className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>{card.clicks} clicks</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(card.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}