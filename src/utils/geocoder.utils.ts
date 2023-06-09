import NodeGeocoder from "node-geocoder"
import "dotenv/config"

const options: NodeGeocoder.Options = {
    provider: "mapquest",
    
  // Optional depending on the providers
//   fetch: ,
  apiKey: String(process.env.GEOCODER_API_KEY), // for Mapquest, OpenCage, Google Premier
//   formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

export default geocoder