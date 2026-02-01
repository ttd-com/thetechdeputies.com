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
        // Pretty print for development with circular reference handling
        let contextStr = '';
        if (context) {
            try {
                const seen = new WeakSet();
                const replacer = (key: string, value: any) => {
                    if (typeof value === 'object' && value !== null) {
                        if (seen.has(value)) {
                            return '[Circular]';
                        }
                        seen.add(value);
                    }
                    return value;
                };
                contextStr = `\n${JSON.stringify(context, replacer, 2)}`;
            } catch {
                contextStr = '\n[Circular reference in context]';
            }
        }
        
        const color = getColor(level);
        const formattedMessage = `${color}[${timestamp}] ${level}: ${message}${contextStr}\x1b[0m`;
        
        // Use appropriate console method based on level
        switch (level) {
            case LogLevel.INFO:
                console.info(formattedMessage, context);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage, context);
                break;
            case LogLevel.ERROR:
                console.error(formattedMessage, context);
                break;
            case LogLevel.DEBUG:
                console.debug(formattedMessage, context);
                break;
            default:
                console.log(formattedMessage, context);
        }
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
