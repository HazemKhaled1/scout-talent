import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {} from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: data.data || null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        meta: data.meta || null,
      })),
    );
  }
}
