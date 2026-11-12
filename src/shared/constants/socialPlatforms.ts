export const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', domains: ['facebook.com', 'fb.com', 'fb.me'], example: 'https://www.facebook.com/your-page' },
  { key: 'instagram', label: 'Instagram', domains: ['instagram.com'], example: 'https://www.instagram.com/your-account' },
  { key: 'youtube', label: 'YouTube', domains: ['youtube.com', 'youtu.be'], example: 'https://www.youtube.com/@your-channel' },
  { key: 'x', label: 'X (Twitter)', domains: ['x.com', 'twitter.com'], example: 'https://x.com/your-account' },
  { key: 'tiktok', label: 'TikTok', domains: ['tiktok.com'], example: 'https://www.tiktok.com/@your-account' },
  { key: 'linkedin', label: 'LinkedIn', domains: ['linkedin.com'], example: 'https://www.linkedin.com/in/your-name' },
] as const;

export type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number]['key'];
export const SOCIAL_KEYS: SocialPlatformKey[] = SOCIAL_PLATFORMS.map((p) => p.key);