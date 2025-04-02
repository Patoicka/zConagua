import { createApp } from "vue";
import "./style.css";
import App from "../src/router/App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPaperPlane,
  faSave,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faSave);
library.add(faPaperPlane);
library.add(faLocationDot);

const app = createApp(App);

app.component("fa-icon", FontAwesomeIcon);
app.mount("#app");
