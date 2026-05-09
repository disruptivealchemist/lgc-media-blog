import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 200,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'imageAlt',
      type: 'text',
      required: false,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Leadership', value: 'leadership' },
        { label: 'Strategy', value: 'strategy' },
        { label: 'AI & Technology', value: 'ai-technology' },
        { label: 'Behavioural Science', value: 'behavioural-science' },
        { label: 'Design', value: 'design' },
        { label: 'Creative', value: 'creative' },
        { label: 'Resources', value: 'resources' },
        { label: 'Digital & Social', value: 'digital-social' },
      ],
    },
    {
      name: 'author',
      type: 'select',
      required: true,
      options: [
        { label: 'Lisa Galea', value: 'lisa' },
        { label: 'AI Research', value: 'ai' },
        { label: 'Guest', value: 'guest' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'seoTitle',
      type: 'text',
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      maxLength: 160,
    },
  ],
}
