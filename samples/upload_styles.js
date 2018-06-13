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
const PUBLISHSTYLES = `${URL}/styles/`;

const style = (name) => {
  return {
    "style": {
      "name": name,
      "filename": `${name}.sld`
    }
  };
}

const uploadStyle = async (path) => {
  const stats = fs.statSync(path);
  const fileSizeInBytes = stats.size;
  const readStream = fs.createReadStream(path);
  const configData = config('POST');
  configData.body = readStream;
  configData.headers["Content-length"] = fileSizeInBytes;
  configData.headers["Content-Type"] = "application/zip";
  const response = await fetch(PUBLISHSTYLES, configData);
  const text = await response.text();
  if (response.ok) {
    return text;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const updateStyle = async (name, style) => {
  const configData = config('PUT');
  configData.body = JSON.stringify(style);
  const response = await fetch(`${PUBLISHSTYLES}/${encodeURI(name)}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The style ${text} has been published!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

uploadStyle('./styles/portugal.zip').then(response => {
  updateStyle(response, style('portugal')).then(response => console.log(response)).catch(error => console.error(error));
}).catch(error => console.error(error));