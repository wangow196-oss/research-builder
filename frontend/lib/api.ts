/** 统一 API 地址配置 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export function api(path: string): string {
  return `${API_BASE}${path}`;
}

export const API_URL = API_BASE;