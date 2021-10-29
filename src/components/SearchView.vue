<template>
  <v-container fluid id="searchDiv">
    <div id="leftBorder"></div>
    <v-row class="pad-bot-2">
      <v-col id="titleDiv" :md="5" :lg="3" class="mr-auto">
        <h1 class="titleText">SWEATER</h1>
        <h1 class="titleText">PALETTESS</h1>
      </v-col>
      <v-spacer></v-spacer>
      <v-col :md="6" :lg="7" :xl="7" class="text-left">
        <PaletteBuilder
          :userColors="userColors"
          @setUserColors="setUserColors"
          @searchClicked="searchClicked"
        />
      </v-col>
    </v-row>

    <transition name="fade">
      <div id="stepsDiv" style="float: left" v-if="showSteps">
        <transition name="fade">
          <h1 v-show="show1" class="stepText" style="text-align: left">
            00 - CREATE A COLOR PALETTE
          </h1>
        </transition>

        <transition name="fade">
          <h1 v-show="show2" class="stepText" style="text-align: left">
            01 - FIND SWEATERS
          </h1>
        </transition>

        <transition name="fade">
          <h1 v-show="show3" class="stepText" style="text-align: left">
            02 - BE HAPPY(?)
          </h1>
        </transition>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="showGif" id="introGifDiv" style="float: right">
        <img class="introGifWidth" src="sweaterScroll.gif" />
      </div>
    </transition>

    <transition name="fade">
      <div id="imgDiv" v-show="showImgs"></div>
    </transition>
    <!-- <h1 class="lom" style="text-align: left">00 - CREATE A COLOR PALETTE</h1>
    <h1 class="lom" style="text-align: left">01 - FIND SWEATERS</h1> 
    <h1 class="lom" style="text-align: left">02 - BE HAPPY(?)</h1> -->
  </v-container>
</template>

<script>
import PaletteBuilder from "@/components/PaletteBuilder.vue";
import _ from "lodash";
import * as diff from "color-diff";
// import VueTypedJs from "vue-typed-js";
export default {
  name: "SearchView",
  props: {
    imgDict: null,
    clustDict: null,
  },
  data() {
    return {
      userColors: [
        { i: 0, r: 212, g: 212, b: 212 }, // index used to track blocks
        { i: 1, r: 175, g: 175, b: 175 },
        { i: 2, r: 91, g: 91, b: 91 },
        { i: 3, r: 51, g: 51, b: 51 },
        { i: 4, r: 0, g: 0, b: 0 },
      ],
      numResults: 50,
      show1: false,
      show2: false,
      show3: false,
      showSteps: true,
      stepsFaded: false,
      showGif: true,
      showImgs: false,
    };
  },
  components: {
    PaletteBuilder,
  },
  mounted() {
    this.showGif = true;
    let interval = 700;
    setTimeout(
      function () {
        this.show1 = true;
      }.bind(this),
      interval
    );

    setTimeout(
      function () {
        this.show2 = true;
      }.bind(this),
      interval * 2
    );

    setTimeout(
      function () {
        this.show3 = true;
      }.bind(this),
      interval * 3
    );
  },
  methods: {
    setUserColors: function (colors) {
      this.userColors = colors;
      console.log("passed color obj in searchview", colors);
      console.log("this.userColors searchview", this.userColors);
    },
    // perform some checks here, then search
    searchClicked: function () {
      this.showImgs = false;
      this.showSteps = false;
      this.showGif = false;

      console.log(
        "this.userColors in searchview before search",
        this.userColors
      );

      this.searchImgs();
    },

    // Find x images w/min MICDP distance to to user palette (this.userColors)
    searchImgs: function () {
      console.log("searching with these colors: ", this.userColors);
      let imgKeys = Object.keys(this.imgDict);
      let distArr = [];
      // console.log(this.userColors);

      // Use MICDP algorithm
      for (let i = 0; i < imgKeys.length; i++) {
        let key = imgKeys[i];
        let imgPalette = this.imgDict[key]["palette"];

        // Remove idx used by blocks from user palette object
        let userNoIdx = _.cloneDeep(this.userColors);
        console.log(userNoIdx);
        console.log(this.userColors);
        userNoIdx.map((col) => {
          delete col.i;
          return JSON.parse(JSON.stringify(col));
        });

        // Calculate MICDP dist. between user pal and this pal
        let pal1PalParse = JSON.parse(JSON.stringify(imgPalette));
        let palDist = this.getPalDist(pal1PalParse, userNoIdx);
        distArr.push({ key: key, dist: palDist });
      }

      distArr.sort((a, b) => {
        return a.dist - b.dist;
      });

      console.log(distArr.slice(0, 3), "fuck");
      console.log(distArr);
      // this.appendImages(distArr);

      setTimeout(
        function () {
          let imgDiv = document.getElementById("imgDiv");
          imgDiv.textContent = "";
          this.appendImages(distArr);
        }.bind(this),
        600
      );

      // console.log(diff);
    },
    appendImages(distArr) {
      for (let i = 0; i < this.numResults; i++) {
        let key = distArr[i].key;
        // sweater div
        let img = document.createElement("img");
        let imgDiv = document.createElement("div");
        imgDiv.classList.add("img_div");

        // sweater caption
        let capText = this.imgDict[key].caption;
        let cap = document.createElement("p");
        cap.innerHTML = capText;

        // sweater distanced
        let distText = distArr[i].dist;
        let dist = document.createElement("p");
        dist.innerHTML = `MICDP Distance: ${distText.toFixed(2)}`;

        // palette div
        let palDiv = document.createElement("div");
        for (let i = 0; i < 5; i++) {
          // Parse color and scale to [0, 255]
          let rgb_obj = this.imgDict[key].palette[i];
          let rgb = JSON.parse(JSON.stringify(rgb_obj));
          // console.log(rgb);
          let col = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

          // Create color block element
          let colBlock = document.createElement("div");
          // let colBlockID = clust + i;
          // colBlock.id = clust.concat(i);
          colBlock.classList.add("col_block");
          colBlock.style.background = col;
          // console.log(col);
          // console.log(colBlockID);
          // console.log(colBlock);
          palDiv.appendChild(colBlock);
        }

        // add text to sweater div
        imgDiv.appendChild(img);
        imgDiv.appendChild(palDiv);
        imgDiv.appendChild(cap);
        imgDiv.appendChild(dist);
        img.src = `images/${distArr[i].key}`;
        img.width = 250;
        let imgScroll = document.getElementById("imgDiv");
        imgScroll.appendChild(imgDiv);
        //console.log(data[key].name);
      }

      this.showImgs = true;
    },
    /**
     * Return MICDP distance between two color palettes.
     * Palettes should have the same number of colors.
     * @param {Array} pal1    Should be array of objects with fields r,g,b
     * @param {Array} pal2    Should be array of objects with fields r,g,b
     */
    getPalDist(pal1, pal2) {
      const numCol = pal1.length;
      let pal1MinDists = [];
      let pal2MinDists = [];

      // Get minimum distance for each color in both palettes
      for (let i = 0; i < numCol; i++) {
        let pal1Col = JSON.parse(JSON.stringify(pal1[i]));
        let minDist1 = this.getMinDist(pal1Col, pal2);
        pal1MinDists.push(minDist1);

        let pal2Col = JSON.parse(JSON.stringify(pal2[i]));
        let minDist2 = this.getMinDist(pal2Col, pal1);
        pal2MinDists.push(minDist2);
      }
      let distSumPal1 = pal1MinDists.reduce((a, b) => {
        return a + b;
      });

      let distSumPal2 = pal2MinDists.reduce((a, b) => {
        return a + b;
      });

      // Calculate MIDCP
      let distAvgPal1 = distSumPal1 / numCol;
      let distAvgPal2 = distSumPal2 / numCol;
      let grandAvg = (distAvgPal1 + distAvgPal2) / 2;
      return grandAvg;
    },

    /**
     * Returns minimum CIEDE200 color difference between col and all colors in pal
     * @param {obj} col    Should have fields r,g,b
     * @param {Array} pal  Should be array of objects with fields r,g,b
     */
    getMinDist(col, pal) {
      let labCol = diff.rgb_to_lab(col);
      let minColDist = Infinity;

      // Iterate through colors and save minimum distance
      for (let i = 0; i < pal.length; i++) {
        let palColLab = diff.rgb_to_lab(pal[i]);
        let colDiff = diff.diff(palColLab, labCol);
        minColDist = Math.min(colDiff, minColDist);
      }
      return minColDist;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#leftBorder {
  position: fixed;
  /* vertical-align: super; */
  height: 10000000px;
  transform: translate(-280%, -10%);
  width: 5px;
  border-left: 2px solid black;
}

.fade-enter-active {
  transition: opacity 0.2s;
}

.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.col_block {
  display: inline-block;
  border: 0.5px solid black;
  width: 10%;
  height: 30px;
  padding-left: 0px;
  padding-right: 0px;
}

#searchDiv {
  width: 80%;
  height: 100%;
  margin: 2.5% auto 0% auto;
  text-align: center;
  /* border: 0.5px solid black; */
}

#clust_prevs {
  width: 85%;
  margin: auto;
  padding-top: 4%;
  /* display: inline-block; */
}

.nopad {
  padding: 0;
  margin: 0px auto 0px auto;
}

#prompt {
  margin: 0px auto 3% auto;
  /* padding-bottom: 10px; */
}

.fadein {
  transition-property: opacity;
  transition-duration: 1s;
}

.img_div {
  display: inline-block;
  width: 22%;
  padding: 0 0 0 0;
  margin: 1%;
  /* border: 0.5px solid black; */
}

.text-left {
  text-align: center;
}

.sweater_img {
  width: 100%;
}

p {
  font-size: 14px;
}

.pad-bot-2 {
  padding-bottom: 1.5em;
}

#title {
  font-size: 10em;
  line-height: 0.85em;
  font-weight: 400;
  margin-top: 0;
}

#titleDiv {
  text-align: left;
  margin: 0px auto 0px auto;
  /* transform: translateY(-50%); */
  width: 100%;
}

.border-bot {
  border-bottom: 3px solid black;
}

.border-trb {
  border-top: 3px solid black;
  border-right: 3px solid black;
  border-bottom: 3px solid black;
}

#stepsDiv {
  padding-top: 15%;
}

#introGifDiv {
  /* width: 100%; */
  padding-top: 7%;
  margin: 0;
}

@media screen and (min-width: 768px) {
  .titleText {
    font-size: 4em;
    line-height: 0.85em;
    font-weight: 400;
    margin: 0px auto 0px auto;
  }
  .stepText {
    font-family: proxima-nova, sans-serif;
    font-size: 2em;
    font-weight: 300;
  }

  .introGifWidth {
    width: 24rem;
  }
}

@media screen and (min-width: 1024px) {
  .titleText {
    font-size: 4em;
    line-height: 0.85em;
    font-weight: 400;
    margin: 0px auto 0px auto;
  }
  .stepText {
    font-family: proxima-nova, sans-serif;
    font-size: 1.5em;
    font-weight: 300;
  }

  .introGifWidth {
    width: 19em;
  }
}

@media screen and (min-width: 1280px) {
  .titleText {
    font-size: 4.5em;
    line-height: 0.85em;
    font-weight: 400;
    margin: 0px auto 0px auto;
  }

  .stepText {
    font-family: proxima-nova, sans-serif;
    font-size: 2em;
    font-weight: 300;
  }

  .introGifWidth {
    width: 30rem;
  }
}
</style>
