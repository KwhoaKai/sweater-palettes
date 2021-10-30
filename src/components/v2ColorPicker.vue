<template>
  <div
    :style="{
      'background-color': `rgb(${setRgb.r}, ${setRgb.g}, ${setRgb.b})`,
    }"
    class="pickerComponent"
    ref="picker"
  ></div>
</template>

<script>
import iro from "@jaames/iro";

export default {
  props: {
    setRgb: {
      default: {
        r: 255,
        g: 255,
        b: 255,
      },
    },
    value: {
      // type: String,
      default: "#ffffff",
    },
    width: {
      type: Number,
      default: 250,
    },
    height: {
      type: Number,
      default: 250,
    },
    handleSvg: {
      type: String,
      default: null,
    },
    handleOrigin: {
      type: Object,
      default() {
        return {
          x: 0,
          y: 0,
        };
      },
    },
    padding: {
      type: Number,
      default: 6,
    },
    handleRadius: {
      type: Number,
      default: 8,
    },
    sliderMargin: {
      type: Number,
      default: 24,
    },
    sliderHeight: {
      type: Number,
      default: undefined,
    },
    borderWidth: {
      type: Number,
      default: 0,
    },
    borderColor: {
      type: String,
      default: "#ffffff",
    },
    display: {
      type: String,
      default: "block",
    },
    layout: {
      type: String,
      default: "block",
    },
    wheelAngle: {
      type: Number,
      default: 0,
    },
    wheelDirection: {
      type: String,
      default: "anticlockwise",
    },
    wheelLightness: {
      type: Boolean,
      default: true,
    },
    css: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      colorPicker: null,
    };
  },
  methods: {
    onInput(color) {
      this.$emit("input", color.rgb);
    },
    onColorChange(color, changes) {
      this.$emit("color:change", {
        color,
        changes,
      });
      let rgb = this.colorPicker.color.rgb;
      let hex = this.colorPicker.color.hexString;
      let colors = { rgb: rgb, hex: hex };
      this.$emit("colChanged", {
        colors,
      });
      // console.log("input end");
    },
    onColorInit(color, changes) {
      this.$emit("color:init", {
        color,
        changes,
      });
    },
    onInputChange(color, changes) {
      this.$emit("input:change", {
        color,
        changes,
      });
    },
    onInputStart(color) {
      this.$emit("input:start", {
        color,
      });
    },
    onInputMove(color) {
      this.$emit("input:move", {
        color,
      });
    },
    onInputEnd(color) {
      this.$emit("input:end", {
        color,
      });
    },
    onMount(colorPicker) {
      this.$emit("mount", {
        colorPicker,
      });
    },
  },
  mounted() {
    this.colorPicker = new iro.ColorPicker(this.$refs.picker, {
      width: this.width,
      height: this.height,
      handleSvg: this.handleSvg,
      color: this.value,
      padding: this.padding,
      layout: this.layout,
      display: this.display,
      css: this.css,
      wheelDirection: this.wheelDirection,
      wheelAngle: this.wheelAngle,
      wheelLightness: this.wheelLightness,
      handleOrigin: this.handleOrigin,
      handleRadius: this.handleRadius,
      sliderMargin: this.sliderMargin,
      sliderHeight: this.sliderHeight,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
    });

    this.colorPicker.on("input:end", this.onInput);
    this.colorPicker.on("color:change", this.onColorChange);
    this.colorPicker.on("color:init", this.onColorInit);
    this.colorPicker.on("input:change", this.onInputChange);
    this.colorPicker.on("input:start", this.onInputStart);
    this.colorPicker.on("input:move", this.onInputMove);
    this.colorPicker.on("input:end", this.onInputEnd);
    this.colorPicker.on("mount", this.onMount);
    // console.log(this.setRgb);
  },
  beforeUnmount() {
    this.colorPicker.off("input:end", this.onInput);
    this.colorPicker.off("color:change", this.onColorChange);
    this.colorPicker.off("color:init", this.onColorInit);
    this.colorPicker.off("input:change", this.onInputChange);
    this.colorPicker.off("input:start", this.onInputStart);
    this.colorPicker.off("input:move", this.onInputMove);
    this.colorPicker.off("input:end", this.onInputEnd);
    this.colorPicker.off("mount", this.onMount);
  },
  watch: {
    value(newValue) {
      if (this.colorPicker.color) {
        this.colorPicker.color.rgb = newValue;
      }
    },
  },
};
</script>

<style scoped>
.pickerComponent {
  /* outline: 2px black dashed; */
  border-radius: 25px;
  /* background-color: rgba(255, 255, 255); */
  padding-bottom: 10%;
}

@media screen and (max-width: 1280px) {
  .pickerComponent {
    /* outline: 2px black dashed; */
    border-radius: 25px;
    /* background-color: rgba(255, 255, 255); */
    padding-bottom: 10%;
  }
}

@media screen and (max-width: 1153px) {
  .pickerComponent {
    /* outline: 2px black dashed; */
    border-radius: 25px;
    /* background-color: rgba(255, 255, 255); */
    padding-bottom: 10%;
  }
}

@media screen and (max-width: 1200px) {
  .pickerComponent {
    /* outline: 2px black dashed; */
    border-radius: 25px;
    /* background-color: rgba(255, 255, 255); */
    padding-bottom: 10%;
  }
}
</style>
