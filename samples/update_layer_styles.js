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

const URL = 'http://localhost:8080/geoserver/rest';

const PUBLISHEDLAYERS = `${URL}/layers`;

const getLayers = async () => {
  const configData = config('GET');
  const response = await fetch(PUBLISHEDLAYERS, configData);
  const json = await response.json();
  if (response.ok) {
    return json;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const updateLayer = async (name) => {
  // const style = {
  //   layer: {
  //     defaultStyle: {
  //       name: name
  //     }
  //   }
  // }
  const style = `<layer><defaultStyle><name>${name}</name></defaultStyle></layer>`
  const configData = config('PUT');
  configData.body = style;
  configData.headers["Content-Type"] = "text/xml";
  const response = await fetch(`${PUBLISHEDLAYERS}/${name}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The layer ${text} has been updated!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

const onError = error => console.error(error)

getLayers().then(wholeLayers => {
  wholeLayers.layers.layer.forEach((layer) => {
    updateLayer(layer.name)
      .then(response => {
        console.log(response)
      }).catch(onError);
  })
}).catch(onError);
