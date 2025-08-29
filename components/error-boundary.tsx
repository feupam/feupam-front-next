'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Ops! Algo deu errado</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'Ocorreu um erro inesperado.'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 