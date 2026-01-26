export const locales = ['en', 'vi'] as const; // Các ngôn ngữ hỗ trợ
export const defaultLocale = 'vi'; // Đổi thành 'vi' để khớp

export type Locale = (typeof locales)[number];
