import NodeGeocoder from 'node-geocoder';
import 'dotenv/config';

const options: NodeGeocoder.Options = {
  provider: 'mapquest',
  apiKey: String(process.env.GEOCODER_API_KEY),
};

const geocoder = NodeGeocoder(options);

export default geocoder;
