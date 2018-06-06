const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');

const URL = 'http://localhost:8080/geoserver/rest';
const WORKSPACE = 'siglibre';
const DATASTORE = 'portugal';

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

uploadShapefile('./data/portugal.zip', DATASTORE).then(response => console.log(response)).catch(error => console.error(error));
