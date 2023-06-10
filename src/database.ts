import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

const { MONGO_URL } = process.env;

const connectMongo = async () => {
  if (!MONGO_URL) throw new Error();
  await mongoose.connect(MONGO_URL);
};

export { connectMongo };
