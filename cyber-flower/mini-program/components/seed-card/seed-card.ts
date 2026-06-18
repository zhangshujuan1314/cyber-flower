import { getFlowerImage } from '../../utils/flowerImage';

Component({
  properties: {
    seed: { type: Object, value: null, observer: 'computeImage' },
    showPlant: { type: Boolean, value: false },
    seedId: { type: String, value: '' },
  },

  data: {
    displayImage: '',
  },

  lifetimes: {
    attached() {
      this.computeImage();
    },
  },

  methods: {
    /** 当 seed 变化时计算展示图：优先 previewImage，回退到本地哈希 */
    computeImage() {
      const seed = this.properties.seed;
      if (!seed) { this.setData({ displayImage: '' }); return; }

      const img = seed.previewImage;
      if (img) {
        this.setData({ displayImage: img });
      } else {
        const species = (seed.genome as Record<string, unknown>)?.species as string
          || seed.name
          || '';
        this.setData({ displayImage: species ? getFlowerImage(species) : '' });
      }
    },

    onPlant() {
      const sid = this.properties.seed?._id || this.properties.seedId;
      this.triggerEvent('plant', { seedId: sid });
    },

    onPreview() {
      const img = this.data.displayImage || this.properties.seed?.previewImage;
      if (img) wx.previewImage({ urls: [img] });
    },
  },
});
