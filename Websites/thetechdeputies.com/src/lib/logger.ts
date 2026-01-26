export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
}

export const logger = {
    info: (message: string, context?: Record<string, any>) => {
        log(LogLevel.INFO, message, context);
    },
    warn: (message: string, context?: Record<string, any>) => {
        log(LogLevel.WARN, message, context);
    },
    error: (message: string, error?: any, context?: Record<string, any>) => {
        log(LogLevel.ERROR, message, { ...context, error: formatError(error) });
    },
    debug: (message: string, context?: Record<string, any>) => {
        if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
            log(LogLevel.DEBUG, message, context);
        }
    },
};

function log(level: LogLevel, message: string, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const payload = {
        timestamp,
        level,
        message,
        ...context,
    };

    // In production, we might want JSON logging for better parsing
    if (process.env.NODE_ENV === 'production') {
        console.log(JSON.stringify(payload));
    } else {
        // Pretty print for development
        const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';
        const color = getColor(level);
        console.log(`${color}[${timestamp}] ${level}: ${message}${contextStr}\x1b[0m`);
    }
}

function formatError(error: any): any {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };
    }
    return error;
}

function getColor(level: LogLevel): string {
    switch (level) {
        case LogLevel.INFO: return '\x1b[36m'; // Cyan
        case LogLevel.WARN: return '\x1b[33m'; // Yellow
        case LogLevel.ERROR: return '\x1b[31m'; // Red
        case LogLevel.DEBUG: return '\x1b[90m'; // Gray
        default: return '\x1b[37m'; // White
    }
}
