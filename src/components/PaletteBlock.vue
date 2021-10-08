<template>
  <v-col :md="2" :xl="2" :lg="2" :sm="2">
    <div
      class="colorDisplay"
      :style="{ 'background-color': curHex }"
      @click="togglePicker"
      @mouseover="hoverBlock = true"
      @mouseleave="hoverBlock = false"
    >
      <!-- <p class="colorText">{{ curHex }}</p> -->
      <div class="hoverDiv">
        <!-- <h1 class="hoverDots" v-show="hoverBlock">...</h1> -->
      </div>
    </div>

    <div id="colorPickerDiv" class="pos-abs">
      <ColorPicker
        v-if="showColorPicker"
        class="pos-rel picker"
        @colChanged="setCols"
        v-bind:width="pickerWidth"
      />
    </div>
  </v-col>
</template>

<script>
//import * as d3 from "d3";
//import * as diff from "color-diff";
// import * as iro from "@jaames/iro/dist/iro.js";
import ColorPicker from "@/components/v2ColorPicker.vue";
export default {
  name: "PaletteBlock",
  props: {
    colObj: Object,
    showIdx: null,
  },
  components: {
    ColorPicker,
  },
  data() {
    return {
      curRgb: null,
      curHex: null,
      pickerWidth: 250,
      i: null,
      r: null,
      g: null,
      b: null,
      hoverBlock: null,
    };
  },
  computed: {
    showColorPicker: function () {
      // console.log(this.showIdx, this.i);
      // console.log(this.i);
      return this.showIdx == this.i;
    },
  },
  mounted() {
    this.i = this.colObj.i;
    this.r = this.colObj.r;
    this.g = this.colObj.g;
    this.b = this.colObj.b;
    this.curHex = this.rgbToHex(this.colObj);
    this.setDims();
    window.addEventListener("resize", this.setDims);
    console.log("block mounted", this.colObj);
    console.log(this.i, this.showIdx);
  },
  methods: {
    componentToHex(c) {
      let hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    },
    rgbToHex(colObj) {
      return (
        "#" +
        this.componentToHex(colObj.r) +
        this.componentToHex(colObj.g) +
        this.componentToHex(colObj.b)
      );
    },
    setCols(colors) {
      console.log("in setCols");
      console.log(this.i, this.r, this.g, this.b, this.showIdx);
      this.curRgb = colors.colors.rgb;
      this.curHex = colors.colors.hex;
      this.$emit("setColor", { rgb: this.curRgb, hex: this.curHex }, this.i);
    },
    togglePicker() {
      // Hide picker if already shown
      if (this.showIdx == this.i) {
        this.$emit("setShowIdx", -1);
      } else {
        // Set showIdx to this block to hide other pickers
        this.$emit("setShowIdx", this.i);
      }
    },
    setDims() {
      let bodyWidth = document.body.clientWidth;
      let blocks = document.getElementsByClassName("colorDisplay");
      // console.log(bodyWidth, "inner width");
      if (bodyWidth >= 1280) {
        this.pickerWidth = 250;
        blocks.forEach((block) => {
          block.style.width = "100px";
          block.style.height = "100px";
        });
      } else if (bodyWidth >= 1000) {
        this.pickerWidth = 200;
        blocks.forEach((block) => {
          block.style.width = "95px";
          block.style.height = "95px";
        });
      } else if (bodyWidth >= 728) {
        this.pickerWidth = 150;
        blocks.forEach((block) => {
          block.style.width = "75px";
          block.style.height = "75px";
        });
      }
      // console.log(this.pickerWidth);
    },
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pos-rel {
  position: relative;
}

.pos-abs {
  position: absolute;
}

.pos-rel {
  position: relative;
}

.float {
  float: left;
}

.colorDisplay {
  border: 0px solid white;
  -webkit-transition: border 0.1s;
}

.colorDisplay:hover {
  /* cursor: pointer; */
  cursor: cell;
  -webkit-transition: border 0.1s;
  border: 5px solid white;
}

@media screen and (min-width: 1280px) {
  .colorDisplay {
    /* height: 85%; */
    width: 85%;
    margin: auto;
    /* border: 0.7px solid black; */
  }

  .picker {
    left: -23%;
    padding-top: 15px;
  }
}

@media screen and (min-width: 768px) {
  .colorDisplay {
    /* height: 85%; */
    width: 85%;
    margin: auto;
    /* border: 0.7px solid black; */
    text-align: center;
  }
  .picker {
    padding-top: 15px;
    left: -21%;
  }

  .hoverDots {
    /* height: 0%; */
    /* position: absolute; */
    /* margin: auto; */
    /* position: fixed; */
    /* left: 0%; */
    /* left: 1px; */
  }

  .hoverDiv {
    position: absolute;
    text-align: center;
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .colorDisplay {
    width: 80%;
    /* background-color: red; */
    /* border: 0.7px solid black; */
    margin: auto;
  }

  .picker {
    padding-top: 10px;
    left: 11.5%;
  }
}
</style>
