import pluginSass from "@cobalt-ui/plugin-sass";
import pluginTs from "@cobalt-ui/plugin-ts";
import pluginJson from "@cobalt-ui/plugin-json";

export default {
  plugins: [pluginSass(), pluginTs(), pluginJson()],
  figma: {
    "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2": [
      // colors
      { style: "Black",     token: "color.black",     type: "color" },
      { style: "Blue",      token: "color.blue",      type: "color" },
      { style: "Dark Gray", token: "color.dark_gray", type: "color" },
      { style: "Green",     token: "color.green",     type: "color" },
      { style: "Purple",    token: "color.purple",    type: "color" },
      { style: "Red",       token: "color.red",       type: "color" },
      { style: "White",     token: "color.white",     type: "color" },
    ],
  },
};
