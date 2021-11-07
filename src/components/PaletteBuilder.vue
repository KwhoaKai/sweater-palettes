<template>
  <v-row id="builder-div">
    <!-- <v-col class="text-right no-pr no-pb" :lg="12" :md="12" no-gutters>
      <p>Please select five colors.</p>
    </v-col> -->
    <v-spacer></v-spacer>
    <v-col class="no-pr no-pb pad-t12" :lg="10" :md="10" no-gutters>
      <!-- <p>Please select five colors.</p> -->
      <span style="float: left" class="text-bold bar-toptext">
        请选择五种颜色 - PLEASE SELECT 5 COLORS
      </span>
      <p style="float: right" class="text-bold bar-toptext trans-left">
        2021年 - 9月
      </p>
      <!-- <span
        v-on:click="searchClicked"
        style="float: right"
        class="text-bold bar-toptext trans-left-down search-text"
      >
        SEARCH
      </span> -->
    </v-col>

    <v-col class="text-left no-pr no-pb no-pt" :lg="12" :md="12" no-gutters>
      <v-row col="12" :sm="12">
        <v-spacer></v-spacer>

        <PaletteBlock
          class="block-div no-pr"
          v-for="block in userColors"
          :key="block.i"
          :colObj="block"
          v-bind:showIdx="showIdx"
          @setShowIdx="setShowIdx"
          @setColor="setColor"
        />
      </v-row>
      <v-row col="12">
        <v-spacer></v-spacer>
        <v-col
          :md="10"
          :lg="10"
          v-on:click="searchClicked"
          class="cursor-pointer"
        >
          <pre class="">SEARCH ––––– NOW</pre>
          <pre>     SEARCH ––––– NOW</pre>
          <pre>     SEARCH ––––– NOW</pre>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import PaletteBlock from "@/components/PaletteBlock.vue";
export default {
  name: "PaletteBuilder",
  props: {
    userColors: Array,
  },
  data() {
    return {
      showIdx: -1,
    };
  },
  mounted() {
    console.log("userColors prop in palette builder mount", this.userColors);
    let _this = this;

    // Any click not on PaletteBock hides ColorPicker
    document.body.addEventListener("mousedown", (e) => {
      e = e || window.event;
      let onSlider =
        (e.target.nodeName == "circle") | (e.target.nodeName == "rect");

      // Was the click on the color display block?
      let onBlock = e.target.classList.contains("colorDisplay");
      if (!onSlider && !onBlock) {
        this.setShowIdx(-1);
        // console.log(this);
        // console.log(this.showIdx, " _this showIdx");
        // console.log("clicked outside block");
      }

      // console.log(this.showIdx, " this showIdx");
    });
  },
  components: {
    PaletteBlock,
  },
  methods: {
    setShowIdx(idx) {
      this.showIdx = idx;
      // console.log("set show index", idx);
    },
    setColor(colors, idx) {
      //
      let newCols = this.userColors;
      let newRgb = colors.rgb;
      newCols[idx].r = newRgb.r;
      newCols[idx].g = newRgb.g;
      newCols[idx].b = newRgb.b;
      this.userColors = newCols;
      console.log("usercols in palettebuilder", this.userColors);
      this.$emit("setUserColors", this.userColors);
    },
    searchClicked() {
      this.$emit("searchClicked");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

#builder-div {
  /* width: 100%; */
  height: 100%;
  /* padding-top: 6%; */
  /* display: inline; */
}

.pad-t12 {
  padding-top: 12px;
}

.no-pr {
  padding-right: 0;
}

.underline {
  text-decoration: underline;
}

.text-bold {
  font-weight: 600;
}

.no-pb {
  padding-bottom: 0;
  margin-bottom: 0;
}

.no-pt {
  padding-top: 0;
  margin-top: 0;
}

.border-bot {
  border-bottom: 3px solid black;
}

.cursor-pointer {
  cursor: pointer;
}

.border-top {
  border-bottom: 3px solid black;
}

.search-text {
  text-decoration: underline;
  cursor: pointer;
}

p {
  font-family: proxima-nova, sans-serif;
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

pre {
  font-size: 16px;
  font-family: proxima-nova, sans-serif;
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.bar-toptext {
  font-size: 12px;
}

@media screen and (min-width: 768px) {
  /* .block-div {
    width: 15%;
    height: 200px;
    margin-left: 1%;
    margin-right: 1%;
    display: inline-block;
  } */
}

@media screen and (max-width: 768px) {
  /* .block-div {
    width: 33%;
    height: 150px;
    margin-left: 2%;
    margin-right: 2%;
    display: inline-block;
  } */
  .trans-left {
    transform: translateX(32%);
  }
}

@media screen and (max-width: 1280px) {
  /* .block-div {
    width: 33%;
    height: 150px;
    margin-left: 2%;
    margin-right: 2%;
    display: inline-block;
  } */
  .trans-left {
    transform: translateX(60%);
  }
}

@media screen and (min-width: 1280px) {
  /* .block-div {
    width: 33%;
    height: 150px;
    margin-left: 2%;
    margin-right: 2%;
    display: inline-block;
  } */
  #builder-div {
    padding-left: 1.5em;
  }

  .trans-left {
    transform: translateX(32%);
  }

  .trans-left-down {
    transform: translate(40%, 2px);
  }
}
</style>
