const fetch = require('node-fetch');
const config = require('./config');

const URL = 'http://localhost:8080/geoserver/gwc/rest';
const WORKSPACE = 'siglibre';

const SEEDLAYERS = `${URL}/seed/`;

const seedLayer = async (layer) => {
  const seed = {
    seedRequest: {
      "name": layer,
      "gridSetId": "EPSG:900913",
      "zoomStart": 0,
      "zoomStop": 8,
      "type": "seed",
      "threadCount": 0
    }
  }
  const configData = config('POST');
  configData.body = JSON.stringify(seed);
  const response = await fetch(`${SEEDLAYERS}/${WORKSPACE}:${layer}.json`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The layer ${text} is being seeded!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const getSeedStatus = async (layer) => {
  const configData = config('GET');
  const response = await fetch(`${SEEDLAYERS}/${WORKSPACE}:${layer}.json`, configData);
  const json = await response.json();
  if (response.ok) {
    return json;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

const layer = 'siglibre';
let seeded = 0;

const moreSeeding = (seeding) => {
  if (seeding['long-array-array'].length !== 0) {
    const [current, total] = seeding['long-array-array'][0]
    if (seeded !== total - current) {
      console.info(`Less than ${ (total - current) > 0 ? total - current : 0 } to go home!!`)
      seeded = total - current;
    }
    getSeedStatus(layer).then(moreSeeding).catch(error => console.error(error));
  }
}

seedLayer(layer).then(() => {
  getSeedStatus(layer).then(moreSeeding).catch(error => console.error(error))
}).catch(error => console.error(error));