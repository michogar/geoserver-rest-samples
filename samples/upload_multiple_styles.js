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
const STYLESDIR = './styles'

const STYLESURL = `${URL}/styles`;

const getStylesPublished = async () => {
  const configData = config('GET');
  const response = await fetch(STYLESURL, configData);
  const json = await response.json();
  if (response.ok) {
    return json;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

const uploadStyle = async (path, name) => {
  const stats = fs.statSync(path);
  const fileSizeInBytes = stats.size;
  const readStream = fs.createReadStream(path);
  const configData = config('PUT');
  configData.body = readStream;
  configData.headers["Content-length"] = fileSizeInBytes;
  configData.headers["Content-Type"] = "application/zip";
  const response = await fetch(`${STYLESURL}/${name}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The style ${text} has been published!`;;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const createStyle = async (name) => {
  const style = (name) => {
    return {
      "style": {
        "name": name,
        "filename": `${name}.sld`
      }
    };
  }
  const configData = config('POST');
  configData.body = JSON.stringify(style(name));
  const response = await fetch(STYLESURL, configData);
  const text = await response.text();
  if (response.ok) {
    return text;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

getStylesPublished().then((styles) => {
  const filesInData = fs.readdirSync(STYLESDIR);
  filesInData.forEach((aFile) => {
    const name = aFile.split('.')[0];
    const included = styles.styles.style.findIndex((style) => {
      return style.name === name;
    })
    if (included === -1) {
      createStyle(name)
        .then(response => {
          uploadStyle(`${STYLESDIR}/${response}.zip`, name)
            .then(response => console.log(response))
            .catch(error => console.error(error));
        }).catch(error => console.error(error));
    }
  })
}).catch(error => console.error(error));
