import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Request, Response } from 'express'; // Import Express types

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration: number = Date.now() - start;

        // Cast the request and response to Express types for type safety.
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const method: string = request.method;
        const path: string = request.originalUrl;
        const status: number = response.statusCode;

        // Determine the client IP safely.
        const forwardedFor = request.headers['x-forwarded-for'];
        let ip: string;
        if (typeof forwardedFor === 'string') {
          ip = forwardedFor.split(',')[0].trim();
        } else if (Array.isArray(forwardedFor)) {
          ip = forwardedFor[0].trim();
        } else {
          ip = request.ip || 'Unknown';
        }

        // Insert the audit log record into PostgreSQL via Prisma.
        // We chain a catch() to handle promise errors rather than awaiting the promise.
        this.prisma.auditLog
          .create({
            data: {
              ip,
              method,
              path,
              status,
              duration,
            },
          })
          .catch((error: unknown) => {
            console.error(
              'AuditLoggerInterceptor: Failed to write audit log:',
              error,
            );
          });
      }),
    );
  }
}
