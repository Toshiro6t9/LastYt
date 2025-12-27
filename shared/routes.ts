import { z } from 'zod';
import { trackInfoSchema } from './schema';

export const api = {
  play: {
    method: 'GET' as const,
    path: '/play', // The user specifically requested /play?url=...
    input: z.object({
      url: z.string().url()
    }),
    responses: {
      200: trackInfoSchema,
      400: z.object({ status: z.boolean(), error: z.string() }),
      500: z.object({ status: z.boolean(), error: z.string() })
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
