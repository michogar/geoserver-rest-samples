const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');
const FormData = require('form-data');

const URL = 'http://localhost:8080/geoserver/rest';
const WORKSPACE = 'siglibre';

const IMPORTERURL = `${URL}/imports`;

const createImport = async (workspace) => {
  const theImport = {
    "import": {
      "targetWorkspace": {
        "workspace": {
          "name": workspace
        }
      }
    }
  }
  const configData = config('POST');
  configData.body = JSON.stringify(theImport);
  const response = await fetch(IMPORTERURL, configData);
  const json = await response.json();
  if (response.ok) {
    return json;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const RASTERDIR = './raster';

const addGeotiff = async (name, theImport) => {
  const path = `${RASTERDIR}/${name}`;
  const readStream = fs.createReadStream(path);
  let formData = new FormData();
  formData.append('name', name);
  formData.append('filedata', readStream)
  const configData = config('POST');
  configData.body = formData;
  delete configData.headers["Content-Type"]
  const response = await fetch(`${IMPORTERURL}/${theImport}/tasks`, configData);
  const json = await response.json();
  if (response.ok) {
    return json;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const TRANSFORMS = [
  {
    "type": "GdalWarpTransform",
    "options": [ "-t_srs", "EPSG:4326"]
  },
  {
    "type": "GdalTranslateTransform",
    "options": [ "-co", "TILED=YES", "-co", "BLOCKXSIZE=512", "-co", "BLOCKYSIZE=512"]
  },
  {
    "type": "GdalAddoTransform",
    "options": [ "-r", "average"],
    "levels" : [2, 4, 8, 16]
  }
]

const createTransform = async (theImport, task, transform) => {
  const configData = config('POST');
  configData.body = JSON.stringify(transform);
  const response = await fetch(`${IMPORTERURL}/${theImport}/tasks/${task}/transforms`, configData);
  const text = await response.text();
  if (response.ok) {
    return transform.type;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const onError = error => console.error(error)

const addTransforms = (id, task, transforms) => {
  let whole = []
  transforms.forEach((transform) => {
    whole.push(createTransform(id, task, transform))
  })
  return whole
}

const launchImport = async (id) => {
  const configData = config('POST');
  const response = await fetch(`${IMPORTERURL}/${id}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The import ${text} has been finished successfully!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

createImport(WORKSPACE).then(response => {
  const id = response['import']['id'];
  addGeotiff('B4_rgb.zip', id)
    .then(response => {
      const task = response['task']['id'];
      const transforms = addTransforms(id, task, TRANSFORMS)
      Promise.all(transforms).then(() => {
        launchImport(id)
          .then((response) => console.log(response))
          .catch(onError)
      }).catch(onError);
    }).catch(onError);
}).catch(onError);