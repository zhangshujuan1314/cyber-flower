import { Injectable } from '@nestjs/common';

export interface SolarTerm {
  name: string; pinyin: string; season: string; description: string; gardenEffect: string;
}

@Injectable()
export class SeasonService {
  /** 获取当前节气（简化版） */
  getCurrentTerm(date: Date = new Date()): SolarTerm {
    const terms: SolarTerm[] = [
      { name: '立春', pinyin: 'Lì Chūn', season: 'spring', description: '东风解冻', gardenEffect: '嫩芽萌动' },
      { name: '谷雨', pinyin: 'Gǔ Yǔ', season: 'spring', description: '雨生百谷', gardenEffect: '花苞饱满' },
      { name: '立夏', pinyin: 'Lì Xià', season: 'summer', description: '蝼蝈鸣', gardenEffect: '绿意盎然' },
      { name: '夏至', pinyin: 'Xià Zhì', season: 'summer', description: '日长之至', gardenEffect: '阳光最盛' },
      { name: '立秋', pinyin: 'Lì Qiū', season: 'autumn', description: '凉风至', gardenEffect: '叶色转金' },
      { name: '秋分', pinyin: 'Qiū Fēn', season: 'autumn', description: '雷收声', gardenEffect: '花色浓郁' },
      { name: '立冬', pinyin: 'Lì Dōng', season: 'winter', description: '水始冰', gardenEffect: '花入冬藏' },
      { name: '冬至', pinyin: 'Dōng Zhì', season: 'winter', description: '日短之至', gardenEffect: '静待春归' },
    ];
    const m = date.getMonth();
    return terms[Math.floor(m / 1.5)] || terms[0];
  }
}
