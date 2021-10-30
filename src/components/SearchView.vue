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
    <canvas id="canvas"></canvas>
  </v-container>
</template>

<script>
import PaletteBuilder from "@/components/PaletteBuilder.vue";
import _ from "lodash";
import * as diff from "color-diff";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
    // this.initThree();
    window.addEventListener("resize", this.handleResize);
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
     * Initiates THREE.js background scene.
     * - Camera tracks mouse hover movement
     * - Considering design: floating sweaters in background?
     *
     */
    initThree() {
      const canvas = document.getElementById("canvas");
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = this.width;
      canvas.height = this.height;
      this.scene = new THREE.Scene();
      this.bgCol = new THREE.Color("rgb(255, 255, 255)");
      // this.scene.fog = new THREE.Fog(1, 0, 10);
      this.scene.background = this.bgCol;
      {
        const near = 0;
        this.far = 6;
        //this.scene.fog = new THREE.Fog(this.bgCol, near, this.far);
      }

      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.z = 0;
      this.camera.position.y = 1;

      this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      this.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: false,
        opacity: 1,
        overdraw: 0.5,
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      console.log(this.mesh);
      this.mesh.position.y += 0.1;
      this.scene.add(this.mesh);
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
      });
      this.renderer.setSize(width, height);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
      hemiLight.position.set(0, 0, 0);
      this.scene.add(hemiLight);

      //the camera rotation pivot
      const orbit = new THREE.Object3D();
      this.orbit = orbit;
      console.log(this.orbit);
      console.log(new THREE.Object3D());
      this.orbit.rotation.order = "YXZ"; //this is important to keep level, so Z should be the last axis to rotate in order...
      this.orbit.position.copy(this.mesh.position);
      this.scene.add(this.orbit);

      //offset the camera and add it to the pivot
      //you could adapt the code so that you can 'zoom' by changing the z value in camera.position in a mousewheel event..
      let cameraDistance = 1;
      this.camera.position.z = cameraDistance;
      this.orbit.add(this.camera);

      // console.log(this.orbit);
      document.addEventListener(
        "mousemove",
        function (e) {
          //console.log(e);
          let scale = -0.0001;
          //  console.log(this.orbit);
          this.orbit.rotateY(e.movementX * scale);
          this.orbit.rotateX(e.movementY * scale);
          this.orbit.rotation.z = 0; //this is important to keep the camera level..
        }.bind(this)
      );

      const dirLight = new THREE.DirectionalLight(0xffffff);
      dirLight.position.set(-3, 10, -10);
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 2;
      dirLight.shadow.camera.bottom = -2;
      dirLight.shadow.camera.left = -2;
      dirLight.shadow.camera.right = 2;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 40;

      //this.scene.add(dirLight);
      this.clock = new THREE.Clock();
      this.time = 0;
      this.delta = 0;

      const size = 100;
      const divisions = 50;

      const gridHelper = new THREE.GridHelper(size, divisions);
      //gridHelper.rotation.x += 0.2;
      gridHelper.position.y = 0;
      this.scene.add(gridHelper);

      this.initBgAnim();
      // this.controls.update();
      this.tick = 0;
      this.animate();
    },

    // Animate THREE.js scene
    animate() {
      // required if controls.enableDamping or controls.autoRotate are set to true
      // this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.shapes.forEach((shape, i) => {
        const speed = 0.05;
        const rot = shape.rotYOffset;

        //shape.rotation.x = rot;
        shape.rotation.y = rot;
      });

      const range = 0.09;
      const scale = 0.1;

      // Idle bob object that camera is attached to
      this.orbit.position.x = Math.cos(this.tick) * range;
      this.orbit.position.y = Math.sin(this.tick) * range;
      requestAnimationFrame(this.animate);
      this.tick += 0.02;
      console.log(this.tick);
    },
    initBgAnim() {
      const canvas = document.getElementById("canvas");
      this.shapes = [];
      // Instantiate new object textured by given image
      function makeInstance(geom, img, x, y) {
        console.log(img);
        //const loader = new THREE.TextureLoader();
        const texture = new THREE.TextureLoader().load(img);
        texture.anisotropy = this.renderer.getMaxAnisotropy();
        const imgmat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: texture,
        });

        const obj = new THREE.Mesh(geom, imgmat);
        this.scene.add(obj);

        let xoff = canvas.clientWidth > 400 ? dir() * Math.random() * 0.6 : 0;

        obj.position.x = x + xoff;
        obj.position.y = y;
        obj.rotYOffset = (dir() * Math.random() * Math.PI) / 6;
        obj.scrollYMult = dir() * Math.random() * 2;
        this.shapes.push(obj);
        return obj;
      }

      // Box dimensions
      const boxWidth = 3;
      const boxHeight = 3;
      const boxDepth = 0.01;
      const boxgeom = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

      const xpad = boxWidth * 1.1;
      const xoffset = 1 * boxWidth;
      const ypad = boxHeight * 1.1;
      const yoffset = 1.5 * boxHeight;

      // img.src = `images/${distArr[i].key}`;

      console.log(this.imgDict);
      // let imgKeys = Object.keys(this.imgDict);
      // // Render images in vertical column
      // for (let i = 0; i < 50; i++) {
      //   if (i > 50) {
      //     break;
      //   }

      //   const path = `images/${imgKeys[i].key}`;
      //   const xloc = 0;
      //   const yloc = i * ypad - yoffset;
      //   makeInstance(boxgeom, path, xloc, -yloc);
      // }
    },
    handleResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      // console.log("canvas should've resized");
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
* {
  z-index: auto;
}

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
  /* pointer-events: none; */
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

#canvas {
  position: fixed;
  padding: 0;
  margin: 0;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);

  z-index: -5;
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
