Component({
  properties: {
    currentSeason: { type: String, value: 'spring' },
    solarTerm: { type: Object, value: null },
  },
  data: {
    seasonIcons: { spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️' } as Record<string, string>,
  },
});
