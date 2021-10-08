import Vue from 'vue'
import App from './App.vue'
import firebase from "firebase";
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  vuetify,

  created() {
    var firebaseConfig = {
      apiKey: "AIzaSyCs2jefWbysKYQObYUtg8KRXvCZ_3nlNZ0",
      authDomain: "sweaterpalettes.firebaseapp.com",
      projectId: "sweaterpalettes",
      storageBucket: "sweaterpalettes.appspot.com",
      messagingSenderId: "615281655256",
      appId: "1:615281655256:web:7de3b15d9a67d470c206ad",
      measurementId: "G-NC1Q5LE31R",
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
  }
}).$mount('#app')
