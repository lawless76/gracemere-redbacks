import { defineCollection, z } from 'astro:content';

// News posts collection
// Each .md file in src/content/news/ becomes a news post
const news = defineCollection({
  type: 'content',
  schema: z.object({
    title:    z.string(),
    date:     z.coerce.date(),
    category: z.string().default('Club News'),
    excerpt:  z.string().optional(),
    image:    z.string().optional(),
    draft:    z.boolean().default(false),
  }),
});

// Editable pages (About, Programs)
// Managed via Decap CMS
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { news, pages };
