module.exports = {
	root: true,
	extends: ["airbnb-base", "prettier", "plugin:import/recommended", "plugin:import/typescript"],
	ignorePatterns: ["dist/**/*", "build/**/*", "public/swagger.json", "public/*"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier", "import"],
	rules: {
		// fixes prettier/eslint formatting conflict
		indent: ["error", "tab", { SwitchCase: 1 }],
		// snake_case used in emitted JSON
		camelcase: "off",
		// circular imports needed for collection sharing
		"import/no-cycle": "off",
		"no-plusplus": "off",
		"@typescript-eslint/no-unused-vars": ["error"],
		"no-console": "off",
		"no-param-reassign": "off",
		"consistent-return": "off",
		"import/prefer-default-export": "off",
		"prefer-destructuring": "off",
		"class-methods-use-this": "off",
		"import/extensions": [
			"error",
			"ignorePackages",
			{
				js: "never",
				jsx: "never",
				ts: "never",
				tsx: "never",
				mjs: "never",
			},
		],
	},
	settings: {
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
				project: "tsconfig.json",
			},
			node: {
				extensions: [".js", ".ts", ".json"],
			},
		},
		"import/extensions": [
			"error",
			"ignorePackages",
			{
				"": "never",
				js: "never",
				jsx: "never",
				ts: "never",
				tsx: "never",
			},
		],
	},
};
