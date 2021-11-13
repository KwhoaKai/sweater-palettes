<template>
  <div id="app">
    <div id="navDiv">
      <!-- <TastyBurgerButton id="menuButton" type="slider" /> -->
      <h1 class="side-vert-text">外套色板</h1>
    </div>

    <!-- <img alt="Vue logo" src="@/assets/logo.png" /> -->
    <SearchView :imgDict="imgDict" :clustDict="clustDict" />
  </div>
</template>                                 

<script>
import SearchView from "@/components/SearchView.vue";
import * as d3 from "d3";
import firebase from "firebase";

export default {
  name: "App",
  components: {
    SearchView,
    // TastyBurgerButton,
    //ClusterView
  },
  data() {
    return {
      imgDict: null,
      clustDict: null,
    };
  },
  async created() {
    const data = await d3.csv("data/clust_asns_cap.csv");
    const parsedData = this.parseData(data);

    this.imgDict = parsedData[0];
    this.clustDict = parsedData[1];
    console.log(this.clustDict);
    console.log(this.imgDict);
  },
  methods: {
    makePaletteObject(palArr) {
      let palObjArr = [];
      // Make rgb object for each color array in palette array
      for (let i = 0; i < palArr.length; i++) {
        let col = palArr[i];
        let colObj = { r: col[0] * 255, g: col[1] * 255, b: col[2] * 255 };
        // let parseObj = JSON.parse(JSON.stringify(colObj));
        palObjArr.push(colObj);
      }
      return palObjArr;
    },
    parseData(data) {
      // console.log(data);
      let img_dict = {};
      let clust_dict = {
        k2: {
          1: [],
          2: [],
        },
        k3: {
          1: [],
          2: [],
          3: [],
        },
        k4: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
        k5: {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
        },
        k6: {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
        },
        k7: {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
          7: [],
        },
        k8: {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
          7: [],
          8: [],
        },
      };
      for (let i = 0; i < data.length; i++) {
        let row = data[i];
        let name = row.imgs;
        let palArr = JSON.parse(row.palette);
        let palObj = this.makePaletteObject(palArr);
        let obj = {
          name: name,
          k2: row.k2,
          k3: row.k3,
          k4: row.k4,
          k5: row.k5,
          k6: row.k6,
          k7: row.k7,
          k8: row.k8,
          caption: row.caption,
          palette: palObj,
        };
        img_dict[name] = obj;
        clust_dict.k2[row.k2].push(obj);
        clust_dict.k3[row.k3].push(obj);
        clust_dict.k4[row.k4].push(obj);
        clust_dict.k5[row.k5].push(obj);
        clust_dict.k6[row.k6].push(obj);
        clust_dict.k7[row.k7].push(obj);
        clust_dict.k8[row.k8].push(obj);
      }
      return [img_dict, clust_dict];
    },
  },
};
</script>

<style>
@import url('<link rel="stylesheet" href="https://use.typekit.net/rbx4xzb.css">');

#app {
  font-family: proxima-nova, sans-serif;
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* color: #2c3e50; */
  color: black;
  /* margin-top: 3%; */
  width: 100%;
  height: 100%;
}

html {
  height: 100%;
  width: 100%;
  /* min-width: 1040px; */
}

body {
  text-align: center;
  height: 100%;
  width: 100%;
  max-width: 1350px;
  margin: auto;
  /* overflow-y: hidden; */
}

#menuButton {
  position: absolute;
}

#searchDiv {
  border-left: 2px solid black;
}

#navDiv {
  float: left;
  transform: translateX(150%);
  writing-mode: vertical-lr;
}

.side-vert-text {
  transform: translate(80%, 15px);
  font-size: 1.7em;
  /* line-height: 2; */
  font-weight: bold;
}

@media screen and (max-width: 1280px) {
  .side-vert-text {
    transform: translate(60%, 15px);
    font-size: 1.7em;
    /* line-height: 2; */
    font-weight: bold;
  }
}

@media screen and (max-width: 1153px) {
  .side-vert-text {
    transform: translate(50%, 15px);
    font-size: 1.7em;
    /* line-height: 2; */
    font-weight: bold;
  }
}

@media screen and (max-width: 1200px) {
  .side-vert-text {
    transform: translate(-10%, 15px);
    font-size: 1.7em;
    /* line-height: 2; */
    font-weight: bold;
  }
}
</style>
