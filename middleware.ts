import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Por enquanto, apenas permite todas as rotas
  // A verificação de isOpen será feita no componente da página
  console.log('[Middleware] Pathname:', request.nextUrl.pathname);
  console.log('[Middleware] Permitindo acesso - verificação movida para componente');
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
