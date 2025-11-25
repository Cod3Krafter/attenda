export interface AccessCodeGenerator {
  generate(): string;
}

export class DefaultAccessCodeGenerator implements AccessCodeGenerator {
  generate(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}