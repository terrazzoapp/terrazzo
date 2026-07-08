import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/data/blog',
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
  }),
});

export const collections = { blog };
