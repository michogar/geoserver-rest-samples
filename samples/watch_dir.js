const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');

const URL = 'http://localhost:8080/geoserver/rest';
const WORKSPACE = 'siglibre';
const DATADIR = './data'
const STYLESDIR = './styles'
const STYLESURL = `${URL}/styles`;
const PUBLISHLAYERGROUPURL = `${URL}/workspaces/${WORKSPACE}/layergroups`;
const ALLLAYERSINWORKSPACE = `${URL}/workspaces/${WORKSPACE}/featuretypes`;

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
  const response = await fetch(`${URL}/layers/${name}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The layer ${text} has been updated!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

const deleteLayerGroup = async (name) => {
  const configData = config('DELETE');
  const response = await fetch(`${URL}/workspaces/${WORKSPACE}/layergroups/${name}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The layergroup ${text} has been deleted!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const getAllLayers = async url => {
  const response = await fetch(url, config('GET'));
  const json = await response.json();
  return json.hasOwnProperty('featureTypes') ? json.featureTypes.featureType : undefined;
};

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

const updateLayerGroup = (response) => {
  console.log(response)
  deleteLayerGroup(WORKSPACE).then((response) => {
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
    console.log(response)
    getAllLayers(ALLLAYERSINWORKSPACE).then((response) => {
      const publishables = response.reduce((acc, layer) => {
        acc.layerGroup.publishables.published.push({
          '@type': 'layer',
          'name': layer.name,
        });
        return acc;
      }, layerGroups);
      publishLayerGroup(publishables)
        .then(response => console.log(response))
        .catch(onError);
    }).catch(onError);
  }).catch(onError);
}

const deleteLayer = async (layer) => {
  const configData = config('DELETE');
  const response = await fetch(`${URL}/layers/${layer}?recurse=true`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The layer ${text} has been deleted!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const deleteStyle = async (style) => {
  const configData = config('DELETE');
  const response = await fetch(`${URL}/styles/${style}`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The style ${text} has been deleted!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
};

const onError = (err) => console.error(err)

const watcher = fs.watch(DATADIR, (evt, filename) => {
  if (evt === 'rename') {
    const exits = fs.existsSync(`${DATADIR}/${filename}`)
    const layer = filename.split('.')[0]
    if (exits) {
      uploadShapefile(`${DATADIR}/${filename}`, layer)
        .then(response => {
          console.log(response)
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
                      .then((response) => {
                        console.log(response)
                        updateLayer(layer)
                          .then(updateLayerGroup).catch(onError);
                      }).catch(onError);
                  }).catch(onError);
              }
            })
          }).catch(onError);
        }).catch(onError);
    } else {
      deleteLayer(layer).then((response) => {
        console.log(response)
        deleteStyle(layer).then((response) => {
          console.log(response)
        }).catch(onError);
      }).catch(onError);
    }
  }
})


