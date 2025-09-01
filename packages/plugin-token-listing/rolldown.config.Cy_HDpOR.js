import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

//#region rolldown.config.ts
const injected_original_dirname = "/home/steve/Development/terrazzo/packages/plugin-token-listing";
const injected_original_filename = "/home/steve/Development/terrazzo/packages/plugin-token-listing/rolldown.config.ts";
const injected_original_import_meta_url = "file:///home/steve/Development/terrazzo/packages/plugin-token-listing/rolldown.config.ts";
var rolldown_config_default = defineConfig({
	input: { index: "./src/index.ts" },
	platform: "browser",
	plugins: [dts()],
	output: {
		dir: "dist",
		format: "es",
		sourcemap: true
	}
});

//#endregion
export { rolldown_config_default as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbGRvd24uY29uZmlnLkN5X0hEcE9SLmpzIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbInJvbGxkb3duLmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICdyb2xsZG93bic7XG5pbXBvcnQgeyBkdHMgfSBmcm9tICdyb2xsZG93bi1wbHVnaW4tZHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgaW5wdXQ6IHtcbiAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJyxcbiAgfSxcbiAgcGxhdGZvcm06ICdicm93c2VyJyxcbiAgcGx1Z2luczogW2R0cygpXSxcbiAgb3V0cHV0OiB7XG4gICAgZGlyOiAnZGlzdCcsXG4gICAgZm9ybWF0OiAnZXMnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsTUFBTSw0QkFBNEI7QUFBSyxNQUFBLDZCQUFBO0FBQUEsTUFBQSxvQ0FBQTtBQUd2Qyw4QkFBZSxhQUFhO0NBQzFCLE9BQU8sRUFDTCxPQUFPLGlCQUNSO0NBQ0QsVUFBVTtDQUNWLFNBQVMsQ0FBQyxLQUFLLEFBQUM7Q0FDaEIsUUFBUTtFQUNOLEtBQUs7RUFDTCxRQUFRO0VBQ1IsV0FBVztDQUNaO0FBQ0YsRUFBQyJ9