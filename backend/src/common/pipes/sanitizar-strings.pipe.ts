import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizeStringsPipe implements PipeTransform {
  private sanitize(val: any): any {
    if (typeof val === 'string') {
      return val.trim();
    }
    if (Array.isArray(val)) {
      return val.map((item) => this.sanitize(item));
    }
    if (val && typeof val === 'object') {
      const sanitized: Record<string, any> = {};
      for (const key of Object.keys(val)) {
        sanitized[key] = this.sanitize(val[key]);
      }
      return sanitized;
    }
    return val;
  }

  transform(value: any, _metadata: ArgumentMetadata) {
    return this.sanitize(value);
  }
}
