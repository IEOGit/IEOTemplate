import esriLoader from 'esri-loader';
import $ from 'jquery';

export default class StaticDevTools {

  static getCleanedString(cadena) {
    // Definimos los caracteres que queremos eliminar
    //var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";
    var specialChars = "!@#$^&%*()+=-[]/{}|:<>?,.";
    for (var i = 0; i < specialChars.length; i++) {
      cadena = cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }
    cadena = cadena.toLowerCase();
    cadena = cadena.replace(/ /g, "_");
    cadena = cadena.replace(/á/gi, "a");
    cadena = cadena.replace(/é/gi, "e");
    cadena = cadena.replace(/í/gi, "i");
    cadena = cadena.replace(/ó/gi, "o");
    cadena = cadena.replace(/ú/gi, "u");
    cadena = cadena.replace(/ñ/gi, "n");
    return cadena;
  }

  static getIdFromEsriLayer(layer, map) {
    if (typeof(layer.type) !== "undefined") {
      return this.getCleanedString(layer.id)
    } else if (typeof(layer.layer) !== "undefined") {

      return this.getCleanedString(layer.layer.id + "_" + layer.id);
    } else {

      console.log("Layer sin Id");
      console.log(layer);
      //return "layer_" + (Math.random(1000)*10000000000000000).toString();
    }
  }

  static getTitleFromEsriLayer(layer) {

    if (typeof(layer.title) !== "undefined" && layer.title !== null) {
      return layer.title;
    } else if (typeof(layer.name) !== "undefined" && layer.name !== null) {
      return layer.name;
    } else {
      return this.getIdFromEsriLayer(layer);
    }
  }

  static getLayerById(id, map) {
    let layer = null;
    for (var i = 0; i < map.layers.items.length; i++) {
      //console.log(map.layers.items[i]);
      if (this.getCleanedString(map.layers.items[i].id) === id || map.layers.items[i].id === id || this.getCleanedString(map.layers.items[i].title) === id) {
        layer = map.layers.items[i];
        return layer;
      }
    }
    return layer;
  }

  static getLayerByTitle(title, map, callback) {
    map.layers.forEach(function(layer) {
      if (layer.type === "map-image") {
        layer.sublayers.forEach(function(sublayer) {
          if (sublayer.sublayers){
            sublayer.sublayers.forEach(function(subsublayer){
              if (subsublayer.title === title){
                callback(subsublayer);
              }
            });
          }
          else if (sublayer.title === title) {
            callback(sublayer);
          }
        });
      }
      if (layer.type === "feature" && layer.title === title) {
        callback(layer);
      }
    });
  }

  static getGroundLayerById(id, map) {
    let layer = null;
    for (var i = 0; i < map.ground.layers.items.length; i++) {
      layer = map.ground.layers.items[i];
      if (layer.id === id) {
        return layer;
      }
    }
    return layer;

  }

  static sortArrayByNumber(myarray, order) {
    myarray.sort(function(a, b) {
      return a - b;
    });
    if (order === "MaxtoMin") {
      myarray.reverse();
    }
    return myarray;
  }

  static sortObjectByValue(myobject, keytoOrder, order) {
    myobject.sort(function(a, b) {
      return a[keytoOrder] - b[keytoOrder];
    });
    if (order === "MaxtoMin") {
      myobject.reverse();
    }
    return myobject;
  }

  static isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
  }

  static _getLocale() {
    let userLang = localStorage.currentLocale || navigator.language || navigator.userLanguage;

    userLang = userLang.substr(0, 2);
    return userLang;
  }

  static _getLabel(id, conf) {
    let userLang = this._getLocale();
    let label;
    for (var i = 0; i < conf.labels.length; i++) {
      if (conf.labels[i].id === id) {
        if (conf.labels[i][userLang] !== undefined) {
          label = conf.labels[i][userLang];
        } else {
          label = conf.labels[i][0];
        }
        break;
      }
    }
    return label;
  }

  static _getTitle(conf) {
    let userLang = this._getLocale();
    let title;
    if (typeof(conf.definition.custom.title) === "string") {
      title = conf.definition.custom.title;
    } else {

      if (conf.definition.custom.title[userLang] !== undefined) {
        title = conf.definition.custom.title[userLang];
      } else {
        title = conf.definition.custom.title[0];
      }
    }
      return title;
  }

static _updateLabels(conf) {
  let labels = [];
  for (var i = 0; i < this.state.labels.length; i++) {
    labels[i] = StaticDevTools._getLabel(i, conf)
  }

  this.setState({labels: labels})
  $('.select2Selector').select2();
}

static _updateTitles(conf) {
  let titles = [];
  for (var i = 0; i < this.state.titles.length; i++) {
    titles[i] = StaticDevTools._getTitle(conf)
  }

  this.setState({titles: titles})

}

static getLayerType(layer) {
  if (layer.type !== undefined) {
    return layer.type;
  } else if (layer.layer.type !== undefined) {
    return layer.layer.type;
  } else {
    return undefined;
  }
}
static getESRILayer(type, options, callback) {
  esriLoader.loadModules([
    'esri/layers/FeatureLayer',
    'esri/layers/TileLayer',
    'esri/layers/WMSLayer',
    "esri/layers/MapImageLayer",
    "esri/layers/ImageryLayer",
    "esri/layers/CSVLayer"
  ], options).then(([
    FeatureLayer,
    TileLayer,
    WMSLayer,
    MapImageLayer,
    ImageryLayer,
    CSVLayer
  ]) => {
    let layerObject;
    switch (type) {
      case "FeatureLayer":
        layerObject = new FeatureLayer(options);
        break;
      case "TileLayer":
        layerObject = new TileLayer(options);
        break;
      case "MapImageLayer":
        layerObject = new MapImageLayer(options);
        break;
      case "WMSLayer":
        layerObject = new WMSLayer(options);
        break;
      case "CSVLayer":
        layerObject = new CSVLayer(options);
        break;
      case "ImageryLayer":
        layerObject = new ImageryLayer(options);
        break;
      default:
        console.log("Feature type not defined");
    }
    callback(layerObject);
  });
}

static getRandomColor() {
  return {
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
    a: 1
  };
}
}
