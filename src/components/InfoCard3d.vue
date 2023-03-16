<template>
  <div id="infoCard3dDiv">
    <p class="font-regular em-2_4 pad-bot-05">{{ getCaption }}</p>
    <div>
      <span class="font-extrabold em-1_4">{{ getSimilarityText }}</span>
      <span style="padding-left: 3.5%;"> O--------------------X--------------------o</span>
      <br>
      <div id="infoCardPaletteDiv" v-html="getPaletteHtml"></div>
    </div>
  </div>
</template>

<script>
// import PaletteBlock from "@/components/PaletteBlock.vue";
export default {
  name: "InfoCard3d",
  props: {
      initHoverData: Object,
      initUserPalette: Array,
      initCurObj: String
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  components: {
  },
  computed: {
      getHoverMessage() {
          console.log(this.sweaterData, " sweaterData");
          return this.curObj == null ? "" : `Hovering over: ${this.curObj}`
      },
      getCaption() {
          let caption = "";
           if (!this.objIsEmpty(this.initHoverData)) {
            caption = this.initHoverData.caption;
          }
          return caption;
      },
      getSimilarityText() {
          let simText = this.objIsEmpty(this.initHoverData) ? "" : "Similarity "
          return simText;
      },
      getPaletteHtml() {
          console.log(this.initUserData, " User data");
          let html = "";
          if (!this.objIsEmpty(this.initHoverData)) {
              const hoverObj = this.initHoverData.palette;
              const userPal = this.initUserPalette;
              html = this.renderPaletteHtml(hoverObj, userPal);
          }
          return html;
      }
  },
  methods: {
      objIsEmpty(obj) {
          return Object.keys(obj).length == 0;
      },
      renderPalette(palObj) {
          let palDiv = document.createElement("div");
              for (let i = 0; i < 5; i++) {
                    // Parse color and scale to [0, 255]
                    let rgbObj = palObj[i];
                    let rgb = JSON.parse(JSON.stringify(rgbObj));
                    // console.log(rgb);
                    let col = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    // Create color block element
                    let colBlock = document.createElement("div");
                    // let colBlockID = clust + i;
                    // colBlock.id = clust.concat(i);
                    colBlock.classList.add("infoCardPalBlock");
                    colBlock.style.background = col;
                    // console.log(col);
                    // console.log(colBlockID);
                    // console.log(colBlock);
                    palDiv.appendChild(colBlock);
               }
            return palDiv;
      },
      renderPaletteHtml(hoverObj, userPal) {
          let palContainer = document.createElement("div");
          let userPalDiv = this.renderPalette(userPal);
          let hoverPalDiv = this.renderPalette(hoverObj);
          palContainer.appendChild(userPalDiv);
          palContainer.appendChild(hoverPalDiv);
          return palContainer.outerHTML;

      },
  },
};
</script>

<style>
#infoCard3dDiv {
  text-align: left;
  padding: 1% 1% 1% 1%;
  width: 65%;
  height: 25%;
  transform: translate(45%, 165%);
  margin: 0;
  /* border: 1px solid black;  */
  /* background-color: white; */
  position: absolute;
}

#infoCardPaletteDiv {
  /* outline: 1px solid black;  */
  display: inline-block;
  width: 35%;
  height: 100%;;
  margin-left: 20%;
  margin-top: 2.5%;
}

.infoCardPalBlock {
  height: 0;
  width: 20%;
  padding-bottom: 20%;
  /* outline: 1px solid black; */
  /* padding-right: 5%; */
  display: inline-block;
}

.font-extrabold {
  font-family: "proxima-nova-extra-condensed", sans-serif;
  font-weight: 700;
  font-style: normal;
}

.font-regular {
  font-weight: 300;
}

.em-2 {
  font-size: 2em;
}

.em-2_5 {
  font-size: 2.5em;
}

.em-2_4 {
  font-size: 2.4em;
}

.em-2_2 {
  font-size: 2.2em;
}

.em-1 {
  font-size: 1em;
}

.em-3 {
  font-size: 3em;
}

.em-1_5 {
  font-size: 1.5em;
}

.em-1_4 {
  font-size: 1.4em;
}

.em-1_3 {
  font-size: 1.3em;
}

.pad-bot-1 {
  padding-bottom: 1em;
}

.pad-bot-05 {
  padding-bottom: 0.5em;
}
</style>
