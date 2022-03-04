import firestorm from 'firestorm-db';

export default function (): void {
  firestorm.address(process.env.FIRESTORM_URL);
  firestorm.token(process.env.FIRESTORM_TOKEN);
}
