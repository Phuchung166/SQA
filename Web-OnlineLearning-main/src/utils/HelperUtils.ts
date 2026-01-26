import { COURSE_TYPE } from '@/constants';
import { Course } from '@/services/courseService';

/**
 * Định dạng số tiền với dấu phẩy phân tách hàng nghìn.
 * @param amount Số tiền cần định dạng
 * @param locale Mã locale, mặc định 'en-US'
 * @returns Chuỗi số tiền đã định dạng
 */
export function formatCurrency(amount: number, locale: string = 'en-US'): string {
  if (typeof amount !== 'number') return '';
  return amount.toLocaleString(locale);
}
/**
 * Calculates the discount percentage between original and sale price.
 * @param originalPrice The original price before discount
 * @param salePrice The discounted/sale price
 * @returns Discount percentage (0-100), or 0 if invalid
 */
export function calculateDiscountPercent(originalPrice: number, salePrice: number): number {
  if (
    typeof originalPrice !== 'number' ||
    typeof salePrice !== 'number' ||
    originalPrice <= 0 ||
    salePrice < 0 ||
    salePrice >= originalPrice
  ) {
    return 0;
  }
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
/**
 * Chuyển chuỗi tiếng Việt (có dấu, khoảng trắng) thành slug tiếng Anh, dùng cho URL.
 * Ví dụ: "Lập trình Web nâng cao" => "lap-trinh-web-nang-cao"
 */
export function encodeUrl(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // Xóa dấu tiếng Việt
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch ngang
    .replace(/-+/g, '-') // Gộp nhiều dấu gạch ngang
    .replace(/^-+|-+$/g, ''); // Xóa gạch ngang đầu/cuối
}

/**
 * Returns the appropriate href for a course depending on its type.
 * - program / specialization => /course-program/:id
 * - otherwise => /course-details/:id
 * Accepts objects that may use different field names for type (type, course_type, program_type)
 */
export function getCourseHref(course: Course): string {
  if (!course || !course.id) return '/course-details/';
  const rawType = course.course_type || null;

  if (rawType === COURSE_TYPE.PROGRAM || rawType === COURSE_TYPE.SPECIALIZATION) {
    return `/course-program/${course.id}`;
  }

  // fallback
  return `/course-details/${course.id}`;
}

/**
 * Parse newline-separated string into array of strings.
 * API returns fields like "Học hay\nBổ X\nHọc thật tốt" as single strings.
 * This converts them to arrays: ["Học hay", "Bổ X", "Học thật tốt"]
 * Also handles if already an array - returns as-is.
 *
 * @param value String or array to parse
 * @returns Array of trimmed, non-empty strings
 */
export function parseNewlineString(value: string | string[] | null | undefined): string[] {
  if (!value) return [];

  // Already an array
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string' && item.trim().length > 0);
  }

  // String value - split by newlines
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  return [];
}
