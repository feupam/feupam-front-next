import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Checa se o site está em modo manutenção via variável de ambiente
  // Defina MAINTENANCE_MODE=true no painel da Vercel para ativar
  const maintenance = 'false'; //process.env.MAINTENANCE_MODE === 'true';

  // Evita loop: permite acessar a página de manutenção
  const pathname = request.nextUrl.pathname;
  if (maintenance && pathname !== '/maintenance.html') {
    console.log('[Middleware] Maintenance mode ativo. Reescrevendo para /maintenance.html');
    return NextResponse.rewrite(new URL('/maintenance.html', request.url));
  }

  // Redireciona /countdown/federa para /home (mantido)
  if (pathname === '/countdown/federa') {
    console.log('[Middleware] Redirecionando /countdown/federa para /home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  console.log('[Middleware] Pathname:', pathname);
  return NextResponse.next();
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
