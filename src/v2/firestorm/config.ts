import firestorm from "firestorm-db";

(() => {
	firestorm.address(process.env.FIRESTORM_URL);
	firestorm.token(process.env.FIRESTORM_TOKEN);
})();
