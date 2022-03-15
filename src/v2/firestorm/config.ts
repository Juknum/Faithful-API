import firestorm from 'firestorm-db';

export default (): void => {
	firestorm.address(process.env.FIRESTORM_URL);
	firestorm.token(process.env.FIRESTORM_TOKEN);
}
