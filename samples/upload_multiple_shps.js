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
const fs = require('fs');
const config = require('./config');

const URL = 'http://localhost:8080/geoserver/rest';
const WORKSPACE = 'siglibre';
const DATADIR = './data'

const DATASTORESPUBLISHED = `${URL}/workspaces/${WORKSPACE}/datastores/`;

const getDatastoresPublished = async () => {
  const configData = config('GET');
  const response = await fetch(DATASTORESPUBLISHED, configData);
  const json = await response.json();
  if (response.ok) {
    return json;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

const uploadShapefile = async (path, datastore) => {
  const PUBLISHSHAPEURL = `${URL}/workspaces/${WORKSPACE}/datastores/${datastore}/file.shp`;
  const stats = fs.statSync(path);
  const fileSizeInBytes = stats.size;
  const readStream = fs.createReadStream(path);
  const configData = config('PUT');
  configData.body = readStream;
  configData.headers["Content-length"] = fileSizeInBytes;
  configData.headers["Content-Type"] = "application/zip";
  const response = await fetch(PUBLISHSHAPEURL, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The shapefile ${text} has been uploaded!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

getDatastoresPublished().then((datastores) => {
  const filesInData = fs.readdirSync(DATADIR);
  filesInData.forEach((aFile) => {
    const name = aFile.split('.')[0];
    const included = datastores.dataStores.dataStore.findIndex((dataStore) => {
      return dataStore.name === name;
    })
    if (included === -1) {
      uploadShapefile(`./data/${name}.zip`, name).then(response => console.log(response)).catch(error => console.error(error));
    }
  })
})
