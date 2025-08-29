// Debug utility for centralized logging
const IS_DEV = process.env.NODE_ENV === 'development';

interface LogContext {
  component?: string;
  action?: string;
  data?: any;
}

class DebugLogger {
  private enabled: boolean;

  constructor(enabled: boolean = IS_DEV) {
    this.enabled = enabled;
  }

  log(message: string, context?: LogContext) {
    if (!this.enabled) return;
    
    const prefix = context?.component ? `[${context.component}]` : '[App]';
    const action = context?.action ? ` ${context.action}:` : '';
    
    console.log(`${prefix}${action} ${message}`, context?.data || '');
  }

  error(message: string, error?: any, context?: LogContext) {
    if (!this.enabled) return;
    
    const prefix = context?.component ? `[${context.component}]` : '[App]';
    console.error(`${prefix} ERROR: ${message}`, error);
  }

  warn(message: string, context?: LogContext) {
    if (!this.enabled) return;
    
    const prefix = context?.component ? `[${context.component}]` : '[App]';
    console.warn(`${prefix} WARNING: ${message}`);
  }

  api(method: string, url: string, status?: number) {
    if (!this.enabled) return;
    
    const statusText = status ? ` (${status})` : '';
    console.log(`[API] ${method.toUpperCase()} ${url}${statusText}`);
  }
}

export const debug = new DebugLogger();

// Specific loggers for common use cases
export const apiLogger = {
  request: (method: string, url: string) => debug.api(method, url),
  response: (method: string, url: string, status: number) => debug.api(method, url, status),
  error: (message: string, error: any) => debug.error(message, error, { component: 'API' })
};

export const componentLogger = (componentName: string) => ({
  log: (message: string, data?: any) => debug.log(message, { component: componentName, data }),
  error: (message: string, error?: any) => debug.error(message, error, { component: componentName }),
  action: (action: string, message: string, data?: any) => debug.log(message, { component: componentName, action, data })
});
