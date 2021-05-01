import { createApp } from "vue";
import App from "./App.vue";
// https://www.npmjs.com/package/@fortawesome/vue-fontawesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { faRobot, faUser, faExpand } from "@fortawesome/free-solid-svg-icons";

library.add(faUser, faRobot, faTimesCircle, faExpand);
const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
