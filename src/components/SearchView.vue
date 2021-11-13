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
          :currentView="currentView"
          @changeView="setView"
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

    <div id="circle">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="300px"
        height="300px"
        viewBox="0 0 300 300"
        enable-background="new 0 0 300 300"
        xml:space="preserve"
      >
        <defs>
          <path
            id="circlePath"
            d=" M 150, 150 m -60, 0 a 60,60 0 0,1 120,0 a 60,60 0 0,1 -120,0 "
          />
        </defs>
        <a href="https://yikaikuo.com">
          <circle cx="150" cy="100" r="75" style="fill-opacity: 0" />

          <g>
            <use xlink:href="#circlePath" fill="none" />
            <text fill="#000">
              <textPath xlink:href="#circlePath">
                yikaikuo.com &nbsp;&nbsp; yikaikuo.com &nbsp;&nbsp; yikaikuo.com
                &nbsp;&nbsp;
              </textPath>
            </text>
          </g>
        </a>
      </svg>
    </div>

    <transition name="fade">
      <div id="imgDiv" v-show="showGrid"></div>
    </transition>

    <transition name="fade">
      <canvas v-show="showGallery" id="canvas"></canvas>
    </transition>
  </v-container>
</template>

<script>
import PaletteBuilder from "@/components/PaletteBuilder.vue";
import _ from "lodash";
import * as diff from "color-diff";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";

export default {
  name: "SearchView",
  props: {
    imgDict: null,
    clustDict: null,
  },
  data() {
    return {
      currentView: {
        GRID_VIEW: false,  
        GALLERY_VIEW: true // Initial gallery view
      }, 
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
      fadingSweaters: false,
      galleryReady: false,
      gridReady: false,
      sweaters: null,
      haveSearchResults: false
    };
  },
  components: {
    PaletteBuilder,
  },
  mounted() {
    this.setupMouse();
    this.postprocessing = {};
    this.initThree();
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
  computed: {
    showGrid() {
      return this.currentView.GRID_VIEW && this.gridReady && this.haveSearchResults;
    },
    showGallery() {
      return this.currentView.GALLERY_VIEW && this.galleryReady && this.haveSearchResults;  
    }
  },
  methods: {
    setView(viewObj) {
      this.currentView = viewObj;
      
      
      // Not best way to do this 
      if (this.currentView.GALLERY_VIEW && this.galleryReady) {
          this.animate(); 
      }

    },
    setUserColors: function (colors) {
      this.userColors = colors;
      // console.log("passed color obj in searchview", colors);
      // console.log("this.userColors searchview", this.userColors);
    },
    // perform some checks here, then search
    searchClicked: function () {
      this.gridReady = false;
      this.showSteps = false;
      this.showGif = false;
      this.galleryReady = false;

      // console.log(
      //   "this.userColors in searchview before search",
      //   this.userColors
      // );

      this.searchImgs();
    },

    // Find x images w/min MICDP distance to to user palette (this.userColors)
    searchImgs: function () {
      // console.log("searching with these colors: ", this.userColors);
      let imgKeys = Object.keys(this.imgDict);
      let distArr = [];
      // console.log(this.userColors);

      // Use MICDP algorithm
      for (let i = 0; i < imgKeys.length; i++) {
        let key = imgKeys[i];
        let imgPalette = this.imgDict[key]["palette"];

        // Remove idx used by blocks from user palette object
        let userNoIdx = _.cloneDeep(this.userColors);
        // console.log(userNoIdx);
        // console.log(this.userColors);
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

      this.haveSearchResults = true;

      setTimeout(
        function () {

          this.appendImages(distArr);
          this.renderSweaters(distArr);

          // if(this.currentView.GRID_VIEW) {
          //   this.appendImages(distArr);
          // } else if(this.currentView.GALLERY_VIEW) {
          //   this.renderSweaters(distArr);
          // }
          
        }.bind(this),
        600
      );

      // console.log(diff);
    },
    setupMouse() {
      let handleWheel = function (event) {
        // console.log(event);
        // this.camera.position.z = this.camera.position.z + event.deltaY * -0.01;
        if(this.currentView.GALLERY_VIEW) {
          this.orbit.position.z = this.orbit.position.z + event.deltaY * -0.01;
          this.mesh.position.z = this.mesh.position.z + event.deltaY * -0.01;
        }
        
      }.bind(this);
      document.addEventListener("wheel", handleWheel);
    },
    /** Fade out and remove from canvas currently rendered sweater objects
     *
     */
    removeCurrentSweaters() {
      // console.log(this.sweaters);

      this.sweaters.children.forEach((sweater) => {
        this.scene.remove(sweater);
        // shape.dispose(); need to dispose mesh, this doesn't work tho
        sweater.geometry.dispose();
        sweater.material.dispose();
        sweater.texture.dispose();
      });

      this.sweaters.children = [];
    },
    /**
     * Show search results in 3d
     */
    renderSweaters(distArr) {

      // Remove rendered sweaters and reset camera position
      this.removeCurrentSweaters();

      this.camera.position.z = 0;
      this.camera.position.y = 1;

      // Instantiate new object textured by given image
      const makeInstance = function (geom, img, x, y, z, xRotDir) {
        const texture = new THREE.TextureLoader().load(img);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        const imgmat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: texture,
        });

        let dir = () => (Math.random() <= 0.5 ? -1 : 1);
        const obj = new THREE.Mesh(geom, imgmat);
        // this.scene.add(obj);
        // const canvas = document.getElementById("canvas");
        // let xoff = () => (Math.random() <= 0.5 ? -1 : 1);

        obj.position.x = x;
        obj.position.y = 1;
        obj.position.z = z;
        obj.rotYOffset = (dir() * Math.random() * Math.PI) / 6;
        obj.scrollYMult = dir() * Math.random() * 2;

        // obj.rotation.y = obj.rotYOffset;
        let xRot = 60 * (Math.PI / 180); 
        obj.rotation.y = xRot * xRotDir;

        // add texture loader as property of object
        obj.texture = texture;
        this.sweaters.add(obj);
        return obj;
      }.bind(this);

      let dir = () => (Math.random() <= 0.5 ? -1 : 1);

      const boxWidth = 4.5;
      const boxHeight = 4.5;
      const boxDepth = 0.01;
      const boxgeom = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);
      const xpad = boxWidth * 1.1;
      const xoffset = boxWidth;
      const ypad = boxHeight * 1.1;
      const yoffset = 1.5 * boxHeight;
      const zpad = boxHeight * 0.5;
      const zoffset = 1 * boxHeight;

      let leftRight = 1;
      // Render image to rectangle type beat
      for (let i = 0; i < this.numResults; i++) {
        let key = distArr[i].key;
        const xloc = xoffset * -leftRight;
        const yloc = i * ypad - yoffset;
        const zloc = (1+i) * zpad;

        // Use images resized to 512 for now 
        const source = `images/resized/512_${key}`;
        let xRotDir = leftRight;
        makeInstance(boxgeom, source, xloc, -yloc, -zloc, xRotDir);
        leftRight = leftRight * -1;

      }
      this.scene.add(this.sweaters);
      // this.gridReady = true;
      this.animate();
      this.galleryReady = true;

    },
    /**
     * Append 2d images with color palettes to document 
     */
    appendImages(distArr) {
      let imgDiv = document.getElementById("imgDiv");
      imgDiv.textContent = "";

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

        // set image width based on viewport width
        let imgWidth = window.innerWidth < 1200 ? 200 : 250;
        img.width = imgWidth;
        let imgScroll = document.getElementById("imgDiv");
        imgScroll.appendChild(imgDiv);
        //console.log(data[key].name);
      }

      this.gridReady = true;
      // this.galleryReady = true;

    },
    /**
     * Initiates THREE.js background scene.
     * - Camera tracks mouse hover movement
     * - Considering design: floating sweaters in background?
     */
    initThree() {

      const canvas = document.getElementById("canvas");
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = this.width;
      canvas.height = this.height;

      this.scene = new THREE.Scene();
      this.bgCol = new THREE.Color("rgb(255, 255, 255)");
      this.scene.background = this.bgCol;

      {
        // Fog to fade out far out listings 
        const FOG_NEAR = 10;
        const FOG_FAR = 50
        const FOG_COLOR = 0xFFFFFF;
        this.scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
      }

      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 50);
      
      // this.camera.position.z = 0;
      // this.camera.position.y = 1;


      // Create mesh and geometry to attach camera to for swivel view --------------------
      let camBoxGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      let camBoxMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: false,
        opacity: 1,
        overdraw: 0.5,
      });

      // Attach camera to mesh object 
      this.mesh = new THREE.Mesh(camBoxGeom, camBoxMat);
      // console.log(camBoxGeom);
      // this.mesh.position.y += 0.1;
      
      const orbit = new THREE.Object3D();
      this.orbit = orbit;
      this.orbit.rotation.order = "YXZ"; //this is important to keep level, so Z should be the last axis to rotate in order...
      this.orbit.position.copy(this.mesh.position);
      this.scene.add(this.mesh);

      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false, 
        alpha: false,
        powerPreference: "high-performance",
        gammaFactor: 2.2,
        outputEncoding: THREE.sRGBEncoding,
        physicallyCorrectLights: true
      });
      this.renderer.setSize(width, height);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      hemiLight.position.set(0, 0, -10);
      this.scene.add(hemiLight);
      

      //offset the camera and add it to the pivot
      //you could adapt the code so that you can 'zoom' by changing the z value in camera.position in a mousewheel event..
      let cameraDistance = 1;
      this.camera.position.z = cameraDistance;
      this.orbit.add(this.camera);
      this.scene.add(this.orbit);

      // Orbit move controls
      document.addEventListener(
        "mousemove",
        function (e) {
          let scale = -0.0005;
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

      const size = this.numResults * 5;
      const divisions = 10;

      const gridHelper = new THREE.GridHelper(size, divisions);
      gridHelper.position.y = -1;
      gridHelper.position.z = (size/2) * -0.8;  
      // gridHelper.postition.z = -size/2;
      this.scene.add(gridHelper);
      this.initPostprocessing();
      this.tick = 0;

      // Group for all sweater images 
      this.sweaters = new THREE.Group();
    },

    initPostprocessing() {

      let width = window.innerWidth;
      let height = window.innerHeight;

      this.renderPass = new RenderPass(this.scene, this.camera);
      this.bokehPass = new BokehPass(this.scene, this.camera, {
        focus: 1.0,
        aperture: 0.00003,
        maxblur: 0.01,
        width: width,
        height: height,
      });

      this.composer = new EffectComposer(this.renderer);

      this.composer.addPass(this.renderPass);
      this.composer.addPass(this.bokehPass);

      this.postprocessing.composer = this.composer;
      this.postprocessing.bokeh = this.bokehPass;

    },
    /**
     * Animate THREE.js scene
     * - Handle scene updates ( camera movement, shape updates )
     */ 
    animate() {
      // Only run animation loop if canvas is shown 
      if(this.currentView.GALLERY_VIEW) {
      // required if controls.enableDamping or controls.autoRotate are set to true
      // this.renderer.render(this.scene, this.camera);
      this.composer.render();

      const RANGE = 0.09;
      const SCALE = 0.1;
      const Z_SCROLL = 0.006;

      // this.camera.position.z -= Z_SCROLL;
      this.mesh.position.z -= Z_SCROLL;
      this.orbit.position.z -= Z_SCROLL;

      // Idle bob object that camera is attached to
      // this.orbit.position.x = Math.cos(this.tick) * range;
      // this.orbit.position.y = Math.sin(this.tick) * range;

      requestAnimationFrame(this.animate.bind(this));
      this.tick += 0.01;
      }

    },
    handleResize() {

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.postprocessing.composer.setSize(
        window.innerWidth,
        window.innerHeight
      );
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

text.hover {
  text-decoration: none;
}

text.hover:hover {
  text-decoration: underline;
}

#leftBorder {
  position: fixed;
  /* vertical-align: super; */
  height: 100000px;
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

#container {
  margin: 0%;
}

#circle {
  position: fixed;
  width: 20%;
  /* outline: 1px black dashed; */
  z-index: 100000000;
  /* padding-bottom: 100%; */
  transform: translate(-55%, -40%);
  overflow: hidden;
}

#circle text {
  position: absolute;
  font-family: "Helvetica Neue", Arial;
  font-size: 16px;
  font-weight: bold;
}

#circle svg {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  -webkit-animation-name: rotate;
  -moz-animation-name: rotate;
  -ms-animation-name: rotate;
  -o-animation-name: rotate;
  animation-name: rotate;
  -webkit-animation-duration: 5s;
  -moz-animation-duration: 5s;
  -ms-animation-duration: 5s;
  -o-animation-duration: 5s;
  animation-duration: 5s;
  -webkit-animation-iteration-count: infinite;
  -moz-animation-iteration-count: infinite;
  -ms-animation-iteration-count: infinite;
  -o-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-timing-function: linear;
  -moz-animation-timing-function: linear;
  -ms-animation-timing-function: linear;
  -o-animation-timing-function: linear;
  animation-timing-function: linear;
}

@-webkit-keyframes rotate {
  from {
    -webkit-transform: rotate(360deg);
  }
  to {
    -webkit-transform: rotate(0);
  }
}
@-moz-keyframes rotate {
  from {
    -moz-transform: rotate(360deg);
  }
  to {
    -moz-transform: rotate(0);
  }
}
@-ms-keyframes rotate {
  from {
    -ms-transform: rotate(360deg);
  }
  to {
    -ms-transform: rotate(0);
  }
}
@-o-keyframes rotate {
  from {
    -o-transform: rotate(360deg);
  }
  to {
    -o-transform: rotate(0);
  }
}
@keyframes rotate {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
}
</style>
