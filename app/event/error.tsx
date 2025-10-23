'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, AlertCircle } from 'lucide-react'

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Event error:', error)
  }, [error])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Erro ao carregar evento</CardTitle>
          </div>
          <CardDescription>
            Não foi possível carregar as informações do evento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <p className="text-sm">O evento pode não existir ou estar temporariamente indisponível.</p>
          </div>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="p-3 bg-muted rounded text-xs font-mono break-all">
              {error.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => reset()} variant="default" className="flex-1">
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/eventos'} className="flex-1">
            Ver todos os eventos
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
