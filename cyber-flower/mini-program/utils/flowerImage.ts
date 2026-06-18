/**
 * 花图本地哈希助手
 * 规则：今后任何显示花图的地方都用此助手算路径，不再依赖后端返回的 imageUrl
 *
 * @param seed - 优先用花的 species 字段，缺失则退回 displayName / name
 * @returns 本地素材路径 /assets/flowers/{1..10}.jpg
 */
const FLOWER_IMAGE_COUNT = 10;

export function getFlowerImage(seed: string): string {
  // djb2 hash — 确定性、无碰撞风险、适合字符串→整数映射
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) >>> 0;
  }
  const index = (hash % FLOWER_IMAGE_COUNT) + 1; // 1..10
  return `/assets/flowers/${index}.jpg`;
}
