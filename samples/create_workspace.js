const fetch = require('node-fetch');
const config = require('./config');

const URL = 'http://localhost:8080/geoserver/rest';
const WORKSPACE = 'siglibre';

const PUBLISHWORKSPACE = `${URL}/workspaces/`;

const createWorkspace = async (name) => {
  const workspace = {
    "workspace":
      {
        "name": name
      }
  }
  const configData = config('POST');
  configData.body = JSON.stringify(workspace);
  const response = await fetch(PUBLISHWORKSPACE, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The workspace ${text} has been created!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

createWorkspace(WORKSPACE).then(response => console.log(response)).catch(error => console.error(error));
