const fetch = require('node-fetch');
const config = require('./config');

const URL = 'http://localhost:8080/geoserver/rest';
const WORKSPACE = 'siglibre';

const allLayersInWorkspaceURL = `${URL}/workspaces/${WORKSPACE}/featuretypes`
const getAllLayers = async url => {
    const response = await fetch(url, config('GET'));
    const json = await response.json();
    return json.hasOwnProperty('featureTypes') ? json.featureTypes.featureType : undefined;
};

const PUBLISHLAYERGROUPURL = `${URL}/workspaces/${WORKSPACE}/layergroups`

const publishLayerGroup = async (layers) => {
  const configData = config('POST');
  configData.body = JSON.stringify(layers);
  const response = await fetch(PUBLISHLAYERGROUPURL, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The layergroup ${text} has been created!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const layerGroups = {
  'layerGroup': {
    'name': WORKSPACE,
    'mode': 'SINGLE',
    'title': WORKSPACE,
    'publishables': {
      'published': [],
    },
  },
};

getAllLayers(allLayersInWorkspaceURL).then((response) => {
  const publishables = response.reduce((acc, layer) => {
    acc.layerGroup.publishables.published.push({
      '@type': 'layer',
      'name': layer.name,
    });
    return acc;
  }, layerGroups);
  publishLayerGroup(publishables).then(response => console.log(response)).catch(error => console.error(error));
}).catch(error => console.error(error));
