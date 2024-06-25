import { createApp } from "vue";
import App from "./App.vue";
import { bootstrap } from "./cool";
import Antd from "ant-design-vue";

const app = createApp(App);

// 启动
bootstrap(app)
	.then(() => {
		app.use(Antd);
		app.mount("#app");
	})
	.catch((err) => {
		console.error("AIObot 启动失败", err);
	});
