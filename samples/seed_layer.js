/**
 *
 * This file is part of geoserver-rest-samples.
 *
 * geoserver-rest-samples is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * geoserver-rest-samples is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with geoserver-rest-samples.  If not, see <http://www.gnu.org/licenses/>.
 */

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