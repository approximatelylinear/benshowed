const sveltePreprocess = require('svelte-preprocess'); // Optional
const { terser } = require('rollup-plugin-terser'); // Optional

// For now, must require with ".default"
const embedSvelte = require('eleventy-plugin-embed-svelte').default;

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(embedSvelte, {
        // Directory that hosts your *.svelte component files (Optional)
        svelteDir: './svelte',
        // Pass options to rollup-plugin-svelte. (Optional)
        rollupPluginSvelteOptions: { preprocess: sveltePreprocess() },
        // Array of Rollup input plugins. (Optional)
        rollupInputPlugins: [],
        // Array of Rollup output plugins. (Optional)
        // rollupOutputPlugins: [terser()]
    });

	return {
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk'
	};
};
