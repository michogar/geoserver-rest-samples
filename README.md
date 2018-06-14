# Geoserver through its REST API

Girona [#siglibre2018](https://twitter.com/search?q=%23siglibre2018) conference code and
[slides (PDF 8.7Mb)](https://github.com/michogar/geoserver-rest-samples/raw/master/docs/geoserver-rest-siglibre-2018.pdf)

## To get the code

```bash
$ git clone https://github.com/michogar/geoserver-rest-samples.git
$ cd geoserver-rest-samples
$ npm install
```

## Getting Started

To be able to use the samples you must get a GeoServer instance running in the url `http://localhost:8080`. All the REST
petitions are pointing to this endpoint.

> The GeoServer version used was 2.12.3

Samples are executed as nodejs scripts. You need a nodejs server installed, version 8.9 and the npm tools.

```bash
$ node -v
v8.9.4

$ npm -v
6.1.0
```

There is 11 samples ordered as npm scripts in the `package.json`. You can run them as npm tasks or directly as node scripts.

* **Create a empty workspace**: `npm run create_workspace` create an empty workspace.
* **Upload a shapefile**: `npm run upload_shapefile` get a zip file from `data` folder containing the shapefile, upload it to the server and publishing the layer.
* **Upload a style**: `npm run upload_styles` get a zip file from `styles` folder, upload it to the server and creates a style after.
Inside the zip file there is a SLD file with the style, and a PNG image with the graphic to the style.
* **Update layer styles**: `npm run update_layer_styles` assigns the style to the layer if they have same names. (e.g. portugal
layer will be styled with portugal style)
* **Upload multiple shapefiles**: `npm run upload_multiple_shapefiles` get every zip file from the `data` folder and upload it
to the server publishing the layer
* **Upload multiple styles**: `npm run upload_multiple_styles` the same, but uploading styles from the `styles` folder.
* **Create a Layergroup**: `npm run create_layergroup`, get all layers from a workspace and create a layer group with them.
* **Seed a layer**: `npm run seed_layergroup`, runs the seed process to the layer group created recently. If you activate the
disk quota into the GWC, you can see how the seed process take some space in it.
* **Watching a directory**: `npm run watching`, this script launches a watcher over the data folder and waits for changes in it.
To see how works, copy the file `andorra.zip` from `more/styles` to `styles` (e.g. `cp more/styles/andorra.zip styles/`). Then
copy `andorra.zip` from `more/data` to `data` (e.g. `cp more/data/andorra.zip data/`). The watcher launchs the script who,
upload the shape, upload the style (previously copied in the `styles` folder), assigns the style to the layer and refresh
the layer group with the new layer.
* **Create a coverage store**: `npm run create_coveragestore`, uploads a GeoTiff from `raster` folder, creates a coveragestore as imagemosaic
 and publish the granule.
* **Import a GeoTiff**: `npm run import_geotiff`, using the importer (**THIS EXTENSION MUST BE INSTALLED**), creates an import,
creates a task with the GeoTiff to upload and creates three transformations using GDAL (**GDAL MUST BE INSTALLED INTO THE SERVER
WHERE GEOSERVER IS RUNNING**).

## Using the GeoServer dockerized
If you are able to use Docker, you can use the `docker-compose` saved in this repo.

```bash
$ cd docker
$ docker-compose up -d
```

To install the importer extension into the docker:

```
$ ./docker/build_exts_dir.sh
```

This script will create a `extensions` folder, will download the extension and will installed it into the geoserver docker.

> Warning: we are preparing the geoserver image to get it with GDAL installed out the box. Meanwhile this occurs you'll
> need install GDAL into the Docker by yourself:
>
> `$ docker-compose exec geoserver sh`
> `# apt update`
> `# apt install gdal-bin`

[More info about GeoServer Docker](https://hub.docker.com/r/oscarfonts/geoserver/)

## Contact
Questions or hiring, please contact with [geomati.co](http://geomati.co)

<a rel="license" href="https://www.gnu.org/licenses/gpl-3.0.en.html"><img alt="Creative Commons License" style="border-width:0" src="https://www.gnu.org/graphics/gplv3-88x31.png" /></a><br />This work is licensed under a <a rel="license" href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU General Public License v3.0</a>.
