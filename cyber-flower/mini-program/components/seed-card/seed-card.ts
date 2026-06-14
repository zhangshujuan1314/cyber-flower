Component({
  properties: {
    seed: { type: Object, value: null },
    showPlant: { type: Boolean, value: false },
    seedId: { type: String, value: '' },
  },
  methods: {
    onPlant() {
      const sid = this.properties.seed?._id || this.properties.seedId;
      this.triggerEvent('plant', { seedId: sid });
    },
    onPreview() {
      const img = this.properties.seed?.previewImage;
      if (img) wx.previewImage({ urls: [img] });
    },
  },
});
