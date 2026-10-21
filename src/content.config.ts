import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Articles, edited by school staff in Sveltia CMS (/admin). Field names match
// public/admin/config.yml; keep the two in step.
const artikel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artikel' }),
  schema: z
    .object({
      title: z.string(),
      series: z.string().optional(),
      part: z.number().int().positive().optional(),
      date: z.coerce.date(),
      author: z.string(),
      category: z.string(),
      cover: z.string().optional(),
      coverAlt: z.string().optional(),
      excerpt: z.string().optional(),
      draft: z.boolean().default(false),
      views: z.number().default(0), // snapshot from the old site; only picks the featured article
      sourceUrl: z.string().optional(),
    })
    .refine((d) => !d.cover || (d.coverAlt && d.coverAlt.trim().length > 0), {
      message: 'coverAlt is required when an article has a cover image',
    }),
});

export const collections = { artikel };
