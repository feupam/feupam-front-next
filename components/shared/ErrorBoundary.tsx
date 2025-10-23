'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center p-4 min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-lg">Erro no componente</CardTitle>
              </div>
              <CardDescription>
                Este componente encontrou um erro e não pôde ser renderizado.
              </CardDescription>
            </CardHeader>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <CardContent>
                <div className="p-3 bg-muted rounded text-xs font-mono break-all">
                  {this.state.error.message}
                </div>
              </CardContent>
            )}
            <CardFooter>
              <Button 
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
                className="w-full"
              >
                Tentar novamente
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
