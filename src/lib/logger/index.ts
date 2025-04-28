/**
 * Sistema de logs para a aplicação
 * Pode ser facilmente estendido para integrar com serviços como Sentry, LogRocket, etc.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: Record<string, any>;
  user?: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isClient = typeof window !== 'undefined';

  constructor() {
    // Inicialização do logger
  }

  /**
   * Log para depuração (aparece apenas em desenvolvimento)
   */
  debug(message: string, options?: LogOptions): void {
    if (!this.isProduction) {
      this.log('debug', message, options);
    }
  }

  /**
   * Log informativo
   */
  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  /**
   * Log de aviso
   */
  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error, options?: LogOptions): void {
    const enhancedOptions = {
      ...options,
      data: {
        ...options?.data,
        errorName: error?.name,
        errorStack: error?.stack,
        errorMessage: error?.message,
      },
    };

    this.log('error', message, enhancedOptions);

    // Aqui você poderia adicionar integração com serviços externos como Sentry
    // if (this.isProduction) {
    //   Sentry.captureException(error || new Error(message), {
    //     extra: enhancedOptions.data,
    //     tags: { context: enhancedOptions.context }
    //   });
    // }
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    const timestamp = new Date().toISOString();
    const context = options?.context || 'app';
    const userId = options?.user || 'anonymous';

    const logData = {
      timestamp,
      level,
      message,
      context,
      userId,
      ...(options?.data ? { data: options.data } : {}),
    };

    // Formata a saída para console
    const consoleMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] [User: ${userId}] ${message}`;

    if (this.isClient) {
      // Log no navegador
      switch (level) {
        case 'debug':
          console.debug(consoleMessage, options?.data || '');
          break;
        case 'info':
          console.info(consoleMessage, options?.data || '');
          break;
        case 'warn':
          console.warn(consoleMessage, options?.data || '');
          break;
        case 'error':
          console.error(consoleMessage, options?.data || '');
          break;
      }
    } else {
      // Log no servidor
      // Pode ser estendido para salvar em arquivo ou enviar para um serviço de logs
      switch (level) {
        case 'debug':
          console.debug(consoleMessage, options?.data || '');
          break;
        case 'info':
          console.info(consoleMessage, options?.data || '');
          break;
        case 'warn':
          console.warn(consoleMessage, options?.data || '');
          break;
        case 'error':
          console.error(consoleMessage, options?.data || '');
          break;
      }

      // Aqui seria possível integrar com sistemas como Winston, Pino, etc.
    }
  }
}

// Exporta uma instância singleton
export const logger = new Logger();

// Utility para logs de API
export const apiLogger = {
  request: (method: string, url: string, data?: any, user?: string) => {
    logger.info(`API Request: ${method} ${url}`, {
      context: 'api',
      user,
      data: { method, url, requestData: data },
    });
  },

  response: (method: string, url: string, status: number, data?: any, user?: string) => {
    const level = status >= 400 ? 'error' : 'info';

    if (level === 'error') {
      logger.error(`API Response: ${method} ${url} [${status}]`, new Error('API Error'), {
        context: 'api',
        user,
        data: { method, url, status, responseData: data },
      });
    } else {
      logger.info(`API Response: ${method} ${url} [${status}]`, {
        context: 'api',
        user,
        data: { method, url, status, responseData: data },
      });
    }
  },

  error: (method: string, url: string, error: Error, user?: string) => {
    logger.error(`API Error: ${method} ${url}`, error, {
      context: 'api',
      user,
      data: { method, url },
    });
  },
};
