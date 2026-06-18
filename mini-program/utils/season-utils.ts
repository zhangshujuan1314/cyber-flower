/**
 * 赛博养花 — 节气与季节工具
 * 二十四节气精确计算 + 季节状态管理
 */

/** 节气定义 */
export interface SolarTerm {
  name: string;
  pinyin: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  month: number;
  description: string;
  suitableFlowers: string[];
  gardenEffect: string;
}

/** 二十四节气数据 */
export const SOLAR_TERMS: Record<string, SolarTerm> = {
  lichun: { name: '立春', pinyin: 'Lì Chūn', season: 'spring', month: 2, description: '东风解冻，蛰虫始振', suitableFlowers: ['迎春', '梅花', '水仙'], gardenEffect: '冰雪初融，嫩芽萌动' },
  yushui: { name: '雨水', pinyin: 'Yǔ Shuǐ', season: 'spring', month: 2, description: '天地气和，草木萌动', suitableFlowers: ['桃花', '杏花', '梨花'], gardenEffect: '细雨绵绵，土壤湿润' },
  jingzhe: { name: '惊蛰', pinyin: 'Jīng Zhé', season: 'spring', month: 3, description: '春雷乍动，万物复苏', suitableFlowers: ['桃花', '樱花', '郁金香'], gardenEffect: '春雷唤醒，花芽破土' },
  chunfen: { name: '春分', pinyin: 'Chūn Fēn', season: 'spring', month: 3, description: '日月阳阴两均天', suitableFlowers: ['樱花', '海棠', '杜鹃'], gardenEffect: '阳光均匀，花开正好' },
  qingming: { name: '清明', pinyin: 'Qīng Míng', season: 'spring', month: 4, description: '气清景明，万物皆显', suitableFlowers: ['牡丹', '芍药', '丁香'], gardenEffect: '春和景明，繁花似锦' },
  guyu: { name: '谷雨', pinyin: 'Gǔ Yǔ', season: 'spring', month: 4, description: '雨生百谷，牡丹吐蕊', suitableFlowers: ['牡丹', '芍药', '月季'], gardenEffect: '春雨贵如油，花苞饱满' },
  lixia: { name: '立夏', pinyin: 'Lì Xià', season: 'summer', month: 5, description: '蝼蝈鸣，蚯蚓出', suitableFlowers: ['月季', '蔷薇', '鸢尾'], gardenEffect: '日照渐长，绿意盎然' },
  xiaoman: { name: '小满', pinyin: 'Xiǎo Mǎn', season: 'summer', month: 5, description: '物致于此小得盈满', suitableFlowers: ['石榴花', '栀子', '茉莉'], gardenEffect: '花苞初成，含苞待放' },
  mangzhong: { name: '芒种', pinyin: 'Máng Zhòng', season: 'summer', month: 6, description: '螳螂生，鵙始鸣', suitableFlowers: ['荷花', '向日葵', '紫薇'], gardenEffect: '盛夏将至，水塘莲开' },
  xiazhi: { name: '夏至', pinyin: 'Xià Zhì', season: 'summer', month: 6, description: '日长之至，影短之至', suitableFlowers: ['荷花', '睡莲', '木槿'], gardenEffect: '阳光最盛，花朵热烈' },
  xiaoshu: { name: '小暑', pinyin: 'Xiǎo Shǔ', season: 'summer', month: 7, description: '温风至，蟋蟀居宇', suitableFlowers: ['荷花', '美人蕉', '蜀葵'], gardenEffect: '热浪轻拂，需勤浇水' },
  dashu: { name: '大暑', pinyin: 'Dà Shǔ', season: 'summer', month: 7, description: '湿热交蒸，万物蒸煮', suitableFlowers: ['荷花', '昙花', '晚香玉'], gardenEffect: '酷暑难耐，夜间开花' },
  liqiu: { name: '立秋', pinyin: 'Lì Qiū', season: 'autumn', month: 8, description: '凉风至，白露降', suitableFlowers: ['菊花', '桂花', '秋海棠'], gardenEffect: '凉风渐起，叶色转金' },
  chushu: { name: '处暑', pinyin: 'Chù Shǔ', season: 'autumn', month: 8, description: '天地始肃，禾乃登', suitableFlowers: ['桂花', '牵牛花', '鸡冠花'], gardenEffect: '暑气消散，桂花飘香' },
  bailu: { name: '白露', pinyin: 'Bái Lù', season: 'autumn', month: 9, description: '露凝而白，秋意渐浓', suitableFlowers: ['菊花', '桂花', '秋兰'], gardenEffect: '晨露晶莹，花瓣带露' },
  qiufen: { name: '秋分', pinyin: 'Qiū Fēn', season: 'autumn', month: 9, description: '雷始收声，水始涸', suitableFlowers: ['菊花', '大丽花', '波斯菊'], gardenEffect: '秋高气爽，花色浓郁' },
  hanlu: { name: '寒露', pinyin: 'Hán Lù', season: 'autumn', month: 10, description: '露气寒冷，将凝结也', suitableFlowers: ['菊花', '一串红', '万寿菊'], gardenEffect: '寒意渐起，花入休眠' },
  shuangjiang: { name: '霜降', pinyin: 'Shuāng Jiàng', season: 'autumn', month: 10, description: '气肃而凝，露结为霜', suitableFlowers: ['菊花', '芙蓉', '茶梅'], gardenEffect: '晨霜薄覆，秋花将尽' },
  lidong: { name: '立冬', pinyin: 'Lì Dōng', season: 'winter', month: 11, description: '水始冰，地始冻', suitableFlowers: ['山茶花', '腊梅', '一品红'], gardenEffect: '初雪轻覆，花入冬藏' },
  xiaoxue: { name: '小雪', pinyin: 'Xiǎo Xuě', season: 'winter', month: 11, description: '虹藏不见，天气上升', suitableFlowers: ['蜡梅', '山茶', '水仙'], gardenEffect: '雪花飘落，银装素裹' },
  daxue: { name: '大雪', pinyin: 'Dà Xuě', season: 'winter', month: 12, description: '鹖鴠不鸣，虎始交', suitableFlowers: ['蜡梅', '梅花', '圣诞红'], gardenEffect: '白雪皑皑，唯有梅花' },
  dongzhi: { name: '冬至', pinyin: 'Dōng Zhì', season: 'winter', month: 12, description: '日短之至，阳气始生', suitableFlowers: ['梅花', '水仙', '仙客来'], gardenEffect: '阴极阳生，静待春归' },
  xiaohan: { name: '小寒', pinyin: 'Xiǎo Hán', season: 'winter', month: 1, description: '雁北乡，鹊始巢', suitableFlowers: ['梅花', '山茶', '报春花'], gardenEffect: '数九寒天，梅花傲雪' },
  dahan: { name: '大寒', pinyin: 'Dà Hán', season: 'winter', month: 1, description: '鸡始乳，征鸟厉疾', suitableFlowers: ['梅花', '水仙', '君子兰'], gardenEffect: '冬之将尽，春之将至' },
};

/**
 * 获取当前节气
 * 使用简化算法（实际生产应使用天文算法精确计算）
 */
export function getCurrentSolarTerm(date: Date = new Date()): SolarTerm {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 节气大致日期映射 (每月两个节气，约在4-8日和19-23日)
  const termDates: Array<{ key: string; month: number; day: number }> = [
    { key: 'xiaohan', month: 1, day: 5 }, { key: 'dahan', month: 1, day: 20 },
    { key: 'lichun', month: 2, day: 4 }, { key: 'yushui', month: 2, day: 19 },
    { key: 'jingzhe', month: 3, day: 6 }, { key: 'chunfen', month: 3, day: 21 },
    { key: 'qingming', month: 4, day: 5 }, { key: 'guyu', month: 4, day: 20 },
    { key: 'lixia', month: 5, day: 5 }, { key: 'xiaoman', month: 5, day: 21 },
    { key: 'mangzhong', month: 6, day: 6 }, { key: 'xiazhi', month: 6, day: 21 },
    { key: 'xiaoshu', month: 7, day: 7 }, { key: 'dashu', month: 7, day: 23 },
    { key: 'liqiu', month: 8, day: 7 }, { key: 'chushu', month: 8, day: 23 },
    { key: 'bailu', month: 9, day: 8 }, { key: 'qiufen', month: 9, day: 23 },
    { key: 'hanlu', month: 10, day: 8 }, { key: 'shuangjiang', month: 10, day: 23 },
    { key: 'lidong', month: 11, day: 7 }, { key: 'xiaoxue', month: 11, day: 22 },
    { key: 'daxue', month: 12, day: 7 }, { key: 'dongzhi', month: 12, day: 22 },
  ];

  // 找到当前日期之前的最后一个节气
  let currentTermKey = 'lichun';
  for (let i = termDates.length - 1; i >= 0; i--) {
    const td = termDates[i];
    if (month > td.month || (month === td.month && day >= td.day)) {
      currentTermKey = td.key;
      break;
    }
  }

  return SOLAR_TERMS[currentTermKey];
}

/**
 * 获取季节进度 (0-1)
 */
export function getSeasonProgress(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 季节起始: 春3/20, 夏6/21, 秋9/23, 冬12/21
  const seasonStarts = [
    { month: 3, day: 20 },  // 春分
    { month: 6, day: 21 },  // 夏至
    { month: 9, day: 23 },  // 秋分
    { month: 12, day: 21 }, // 冬至
  ];

  // 简化：使用月份计算季节阶段 (0-3)
  const totalDays = 365;
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // 春分日是一年中的约第79天
  const springStart = 79;
  const adjustedDay = (dayOfYear - springStart + totalDays) % totalDays;

  return (adjustedDay % 91) / 91;
}
