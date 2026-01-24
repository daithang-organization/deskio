import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  private formatMessage(message: string, context?: string) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      context: context || this.context,
      message,
    });
  }

  log(message: any, context?: string) {
    super.log(this.formatMessage(message, context));
  }

  error(message: any, trace?: string, context?: string) {
    const errorLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: context || this.context,
      message,
      trace,
    });
    super.error(errorLog);
  }

  warn(message: any, context?: string) {
    const warnLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      context: context || this.context,
      message,
    });
    super.warn(warnLog);
  }

  debug(message: any, context?: string) {
    const debugLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      context: context || this.context,
      message,
    });
    super.debug(debugLog);
  }

  verbose(message: any, context?: string) {
    const verboseLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'VERBOSE',
      context: context || this.context,
      message,
    });
    super.verbose(verboseLog);
  }
}
