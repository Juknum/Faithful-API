module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ["airbnb-base", "prettier"],
	ignorePatterns: ["src/v1/**/*", "dist/**/*", "build/**/*", "public/swagger.json"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint", "prettier"],
	rules: {},
};
