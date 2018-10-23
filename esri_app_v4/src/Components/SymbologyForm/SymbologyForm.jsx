import React from 'react';
// import ReactDOM from 'react-dom';
import esriLoader from 'esri-loader';
import Select2 from 'react-select2-wrapper';
import {Button} from 'react-bootstrap';
import {Panel} from 'react-bootstrap';
import {Table} from 'react-bootstrap';
import {SketchPicker} from 'react-color';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import 'font-awesome/css/font-awesome.css';
import './SymbologyForm.css';

const conf = require('./widgetconfig.json');
const appconf = require('../../appconf.json');

export default class SymbologyForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contentPanel: "",
      tableSymbologlybyClass: "",
      geometryType: this.props.geometryType,
      fieldSelect: StaticDevTools._getLabel(21, conf),
      fields: this.props.fields,
      minValueField: "0",
      maxValueField: "0",
      typeSymbol: StaticDevTools._getLabel(0, conf),
      stylePoint: conf.initvalues.stylePoint,
      outline: {
        styleLine: conf.initvalues.outline.styleLine,
        cap: conf.initvalues.outline.cap,
        join: conf.initvalues.outline.join,
        miterLimit: conf.initvalues.outline.miterLimit,
        width: conf.initvalues.outline.width,
        lineColor: conf.initvalues.outline.lineColor
      },
      angleValue: conf.initvalues.angleValue,
      size: conf.initvalues.size,
      stylePolygon: conf.initvalues.stylePolygon,
      xoffset: conf.initvalues.xoffset,
      yoffset: conf.initvalues.yoffset,
      fillColor: conf.initvalues.fillColor,
      fillcolorhex: {
        a: 1,
        b: 255,
        g: 255,
        r: 255
      },
      linecolorhex: {
        a: 1,
        b: 255,
        g: 255,
        r: 255
      },
      minfillcolor: {
        a: 1,
        b: 26,
        g: 147,
        r: 218
      },
      maxfillcolor: {
        a: 1,
        b: 255,
        g: 255,
        r: 255
      },
      url: conf.initvalues.url,
      width: conf.initvalues.width,
      height: conf.initvalues.height,
      xscale: conf.initvalues.xscale,
      yscale: conf.initvalues.yscale,
      advancedSymbol: "NoSelect",
      displayColorPicker: false,
      labels: conf.labels
    };
    this._applySymbol = this._applySymbol.bind(this);
    this._switchSymbolSelected = this._switchSymbolSelected.bind(this);
    this._handleChangeStyle = this._handleChangeStyle.bind(this);
    this._handleChangeInput = this._handleChangeInput.bind(this);
    this._handleChangeLineInput = this._handleChangeLineInput.bind(this);
    this._handleChangeFillColor = this._handleChangeFillColor.bind(this);
    this._handleChangeLineColor = this._handleChangeLineColor.bind(this);
    this._handleChangeMinFillColor = this._handleChangeMinFillColor.bind(this);
    this._handleChangeMaxFillColor = this._handleChangeMaxFillColor.bind(this);
    this._changeFieldSelected = this._changeFieldSelected.bind(this);
    this._calcualteMaxMinValue = this._calcualteMaxMinValue.bind(this);
    this._handleButtonClosePanel = this._handleButtonClosePanel.bind(this);
    this._getcontentPanel = this._getcontentPanel.bind(this);
    this._generateClassesTable = this._generateClassesTable.bind(this);
    this._handleClickColorPicker = this._handleClickColorPicker.bind(this);
    this._handleChangeColorPicker = this._handleChangeColorPicker.bind(this);
    this._handleCheckAdvancedSymbol = this._handleCheckAdvancedSymbol.bind(this);

    let thisWidget = this;

    esriLoader.loadModules([
      "esri/tasks/support/Query", "esri/tasks/QueryTask", "esri/Graphic"
    ], appconf.esrioptions).then(([Query, QueryTask, Graphic]) => {
      thisWidget.Query = Query;
      thisWidget.QueryTask = QueryTask;
      thisWidget.Graphic = Graphic;
    });
  }

  componentWillMount() {}

  componentDidMount() {}

  // componentWillUpdate(nextProps, nextState) {
  //   console.log(nextState);
  // }

  _applySymbol(event) {
    let layer,
      newSymbol;
    layer = this.props.sublayer;
    switch (this.state.typeSymbol) {
      case "simple-marker":
        newSymbol = {
          type: this.state.typeSymbol,
          style: this.state.stylePoint,
          outline: {
            style: this.state.outline.styleLine,
            cap: this.state.outline.cap,
            join: this.state.outline.join,
            miterLimit: parseInt(this.state.outline.miterLimit, 10),
            width: parseInt(this.state.outline.width, 10),
            color: this.state.outline.lineColor
          },
          angle: parseInt(this.state.angleValue, 10),
          size: parseInt(this.state.size, 10),
          xoffset: parseInt(this.state.xoffset, 10),
          yoffset: parseInt(this.state.yoffset, 10),
          color: [112, 168, 0, 0.25]
        }
        break;
      case "picture-marker":
        newSymbol = {
          type: this.state.typeSymbol,
          url: this.state.url,
          width: parseInt(this.state.width, 10),
          height: parseInt(this.state.height, 10),
          angle: parseInt(this.state.angleValue, 10),
          xoffset: parseInt(this.state.xoffset, 10),
          yoffset: parseInt(this.state.yoffset, 10)
        }
        break;
      case "simple-line":
        newSymbol = {
          type: this.state.typeSymbol,
          style: this.state.outline.styleLine,
          cap: this.state.outline.cap,
          join: this.state.outline.join,
          miterLimit: parseInt(this.state.outline.miterLimit, 10),
          width: parseInt(this.state.outline.width, 10),
          color: this.state.outline.lineColor
        }
        break;
      case "simple-fill":
        newSymbol = {
          type: this.state.typeSymbol,
          style: this.state.stylePolygon,
          outline: {
            style: this.state.outline.styleLine,
            cap: this.state.outline.cap,
            join: this.state.outline.join,
            miterLimit: parseInt(this.state.outline.miterLimit, 10),
            width: parseInt(this.state.outline.width, 10),
            // color: this.state.outline.lineColor
            color: '#FF0000'
          },
          color: this.state.fillColor
        }

        break;
      case "picture-fill":
        newSymbol = {
          type: this.state.typeSymbol,
          url: this.state.url,
          width: parseInt(this.state.width, 10),
          height: parseInt(this.state.height, 10),
          xoffset: parseInt(this.state.xoffset, 10),
          yoffset: parseInt(this.state.yoffset, 10),
          xscale: parseInt(this.state.xscale, 10),
          yscale: parseInt(this.state.yscale, 10),
          outline: {
            style: this.state.outline.styleLine,
            cap: this.state.outline.cap,
            join: this.state.outline.join,
            miterLimit: parseInt(this.state.outline.miterLimit, 10),
            width: parseInt(this.state.outline.width, 10),
            // color: [76, 230, 0, 1]
            color: '#FF0000'
          }
        }
        break;
      default:
        break;

    }
    let render;
    switch (this.state.advancedSymbol) {
      case "ContinuousColor":
        let defaultSym = {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          outline: { // autocasts as new SimpleLineSymbol()
            color: this.state.outline.lineColor,
            style: this.state.outline.styleLine,
            cap: this.state.outline.cap,
            join: this.state.outline.join,
            miterLimit: parseInt(this.state.outline.miterLimit, 10),
            width: parseInt(this.state.outline.width, 10)
          }
        };
        let colorMin = document.getElementById('buttonColor_minVal').style.background.split(')')[0];
        colorMin = colorMin.split('(')[1];
        colorMin = colorMin.split(', ');
        let colorMax = document.getElementById('buttonColor_maxVal').style.background.split(')')[0];
        colorMax = colorMax.split('(')[1];
        colorMax = colorMax.split(', ');
        render = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: defaultSym,
          visualVariables: [
            {
              type: "color",
              field: this.state.fieldSelect,
              // normalizationField: this.state.fieldSelect,
              stops: [
                {
                  value: parseInt(this.state.minValueField, 10),
                  color: colorMin,
                  label: "<" + this.state.minValueField
                }, {
                  value: parseInt(this.state.maxValueField, 10),
                  color: colorMax,
                  label: ">" + this.state.maxValueField
                }
              ]
            }
          ]
        }
        console.log(render);
        break;
      case "ClassbyField":
        let symbolsArray = []
        let table = document.getElementById('colorsByClassTable');
        for (let row of table.rows) {
          if (row.cells[0].nodeName !== 'TH') {
            let colorpicker = row.cells[2].querySelector("#buttonColor_" + row.cells[0].innerHTML);
            let color = colorpicker.style.background.split(')')[0];
            color = color.split('(')[1];
            color = color.split(', ');
            symbolsArray.push({
              value: row.cells[1].innerHTML,
              symbol: {
                type: "simple-fill",
                color: color,
                style: "solid",
                outline: {
                  style: this.state.outline.styleLine,
                  cap: this.state.outline.cap,
                  join: this.state.outline.join,
                  miterLimit: parseInt(this.state.outline.miterLimit, 10),
                  width: parseInt(this.state.outline.width, 10),
                  color: this.state.outline.lineColor
                }
              },
              label: row.cells[1].innerHTML
            });
          }
        }

        render = {
          type: "unique-value",
          defaultSymbol: {
            type: "simple-fill",
            color: "red",
            style: "solid",
            outline: {
              width: 1,
              color: "white"
            }
          },
          defaultLabel: this.state.fieldSelect,
          field: this.state.fieldSelect,
          uniqueValueInfos: symbolsArray
        };
        break;
      case "NoSelect":
        render = {
          type: "simple",
          symbol: newSymbol
        };
        break;
      default:
        render = {
          type: "simple",
          symbol: newSymbol
        };
        break;
    }

    if (layer.type === "graphics") {
      let newGraphics = [];
      let thisWidget = this;
      layer.graphics.forEach(function(graphic) {
        graphic.symbol = newSymbol;
        let newgraphic = new thisWidget.Graphic(graphic);
        newGraphics.push(newgraphic);
      });

      layer.removeAll();
      layer.addMany(newGraphics);
    } else {
      layer.renderer = render;
    }
    event.preventDefault();
    document.getElementById('cancel-btn').click();

  }

  _switchSymbolSelected(event) {
    let typeSelected,
      newcontentPanel,
      PanelElement;
    typeSelected = this.refs.typeSymbol.el[0].value;
    PanelElement = document.getElementById('SymbolPanel')
    PanelElement.style.display = 'block';
    newcontentPanel = this._getcontentPanel(typeSelected);
    this.setState({contentPanel: newcontentPanel, typeSymbol: event.target.value});
  }

  _handleOpenPanel(idsPanel, type) {
    let panels = document.querySelectorAll(".panel-Symbology");
    panels.forEach(function(panel) {
      panel.style.display = "none";
    });
    document.getElementById(idsPanel[0]).style.display = 'block';

    if (idsPanel[0] === "colorPanel") {
      let fillPickerColor,
        linePickerColor;
      fillPickerColor = document.getElementById('pickerFillColor');
      linePickerColor = document.getElementById('pickerLineColor');
      if (type === "fill") {
        fillPickerColor.style.display = 'block';
        linePickerColor.style.display = 'none';
      } else if (type === "line") {
        fillPickerColor.style.display = 'none';
        linePickerColor.style.display = 'block';
      }
    }
  }

  _handleButtonClosePanel() {
    let panels,
      PanelElement;
    panels = document.querySelectorAll(".panel-Symbology");
    panels.forEach(function(panel) {
      panel.style.display = "none";
    });
    PanelElement = document.getElementById('SymbolPanel');
    PanelElement.style.display = 'block';
  }

  _handleChangeStyle(event) {
    this.setState({style: event.target.value});
  }

  _handleChangeInput(event) {
    let param = event.target.attributes.inputsymbolparam.nodeValue;
    this.setState({[param]: event.target.value});
  }

  _handleChangeLineInput(event) {
    let param = event.target.attributes.inputsymbolparam.nodeValue;
    let newOutline = this.state.outline;
    newOutline[param] = event.target.value;
    this.setState({outline: newOutline});
    let outlineInputs = document.getElementsByClassName('outlineInput');
    Array.from(outlineInputs).forEach(function(element) {
      element.placeholder = [
        newOutline.style,
        newOutline.cap,
        newOutline.join,
        newOutline.miterLimit,
        newOutline.width,
        newOutline.lineColor
      ];
    });
  }

  _handleChangeFillColor(color) {
    let newColor = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a]
    this.setState({fillColor: newColor, fillcolorhex: color.rgb});
    let fillColorInputs = document.getElementsByClassName('fillColorInput');
    Array.from(fillColorInputs).forEach(function(element) {
      element.placeholder = newColor;
    });
  }

  _handleChangeLineColor(color) {
    let newColor = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a];
    let newOutline = this.state.outline;
    newOutline.lineColor = newColor;
    this.setState({outline: newOutline, linecolorhex: color.rgb});
    let outlineInputs = document.getElementsByClassName('outlineInput');
    Array.from(outlineInputs).forEach(function(element) {
      element.placeholder = [
        newOutline.style,
        newOutline.cap,
        newOutline.join,
        newOutline.miterLimit,
        newOutline.width,
        newOutline.lineColor
      ];
    });
    let outlineInputsColor = document.getElementsByClassName('lineColorInput');
    Array.from(outlineInputsColor).forEach(function(element) {
      element.placeholder = newOutline.lineColor;
    });
  }

  _handleChangeMinFillColor(color) {
    let newColor = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a]
    this.setState({minfillcolorhex: newColor, minfillcolor: color.rgb});
    let maxColor = this.state.maxfillcolorhex;
    let fillColorInputs = document.getElementsByClassName('fillmultipleColorInput');
    Array.from(fillColorInputs).forEach(function(element) {
      element.placeholder = newColor + " - " + maxColor;;
    });
  }

  _handleChangeMaxFillColor(color) {
    let newColor = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a]
    this.setState({maxfillcolorhex: newColor, maxfillcolor: color.rgb});
    let minColor = this.state.minfillcolorhex;
    let fillColorInputs = document.getElementsByClassName('fillmultipleColorInput');
    Array.from(fillColorInputs).forEach(function(element) {
      element.placeholder = minColor + " - " + newColor;
    });
  }

  _handleCheckAdvancedSymbol(target) {
    //let displayValue;
    let continuousColorPanel = document.getElementById("continousColorPanel");
    let simbologyClassPanel = document.getElementById("symbologybyClassPanel");
    switch (target.value) {
      case "NoSelect":
        continuousColorPanel.style.display = "none";
        simbologyClassPanel.style.display = "none";
        break;
      case "ContinuousColor":
        continuousColorPanel.style.display = "block";
        simbologyClassPanel.style.display = "none";
        break;
      case "ClassbyField":
        continuousColorPanel.style.display = "none";
        simbologyClassPanel.style.display = "block";
        break;
      default:
        break;
    }

    this.setState({advancedSymbol: target.value});
  }

  _changeFieldSelected(event) {
    let fieldSelected,
      symbologySelected;
    fieldSelected = event.target.value;
    symbologySelected = event.target.getAttribute("typesymbology");
    switch (symbologySelected) {
      case "continousColor":
        this._calcualteMaxMinValue(fieldSelected);
        break;
      case "byClass":
        this._generateClassesTable(fieldSelected);
        break;
      default:
        break;
    }
  }

  _calcualteMaxMinValue(fieldSelected) {
    let thisWidget,
      url,
      qtask,
      query;
    thisWidget = this;
    url = this.props.sublayer.url;

    qtask = new this.QueryTask({url: url});

    query = new this.Query();

    query.where = "1=1";
    query.outFields = [fieldSelected];
    query.returnDistinctValues = true;
    query.returnGeometry = false;
    query.returnJSON = true;
    query.orderByFields = [fieldSelected + " ASC"]

    qtask.execute(query).then(function(result) {
      let minValue,
        maxValue;
      minValue = String(result.features[0].attributes[fieldSelected]);
      maxValue = String(result.features[result.features.length - 1].attributes[fieldSelected]);
      thisWidget.setState({fieldSelect: fieldSelected, minValueField: minValue, maxValueField: maxValue});
      document.getElementById("minValueFieldInput").placeholder = thisWidget.state.minValueField;
      document.getElementById("maxValueFieldInput").placeholder = thisWidget.state.maxValueField;
    });
  }

  _generateClassesTable(fieldSelected) {
    let thisWidget,
      url,
      qtask,
      query,
      table,
      bodyTable;
    thisWidget = this;
    url = this.props.sublayer.url;
    qtask = new this.QueryTask({url: url});

    const styles = {
      popover: {
        position: 'absolute',
        zIndex: '2',
        display: 'none'
      },
      cover: {
        position: 'absolute',
        zIndex: '2',
        display: 'none'
      },
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer'
      }
    }

    query = new this.Query();

    query.where = "1=1";
    query.outFields = [fieldSelected];
    query.returnDistinctValues = true;
    query.returnGeometry = false;
    query.returnJSON = true;
    query.orderByFields = [fieldSelected + " ASC"];

    qtask.execute(query).then(function(result) {
      bodyTable = result.features.map((value, index) => {
        let color = StaticDevTools.getRandomColor();
        let backcolor = {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
        }
        return (<tr key={index}>
          <td>{index}</td>
          <td>{value.attributes[fieldSelected]}</td>
          <td>
            <div>
              <div style={styles.swatch}>
                <div color={[color.r, color.g, color.b, color.a]} id={'buttonColor_' + index} style={backcolor} onClick={thisWidget._handleClickColorPicker}/>
              </div>
              <div id={'colorPickerDiv_' + index} style={styles.popover}>
                <div style={styles.cover}/>
                <SketchPicker color={color} onChange={(e) => thisWidget._handleChangeColorPicker('colorPickerDiv_' + index, e)}/>
              </div>
            </div>
          </td>
        </tr>);
      });
      table = <Table id="colorsByClassTable" striped="striped" bordered="bordered" condensed="condensed" hover="hover" responsive="responsive">
        <thead>
          <tr>
            <th>#</th>
            <th>Value</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          {bodyTable}
        </tbody>
      </Table>;

      thisWidget.setState({
        tableSymbologlybyClass: table,
        fieldSelect: fieldSelected
      }, function() {
        let Panel = thisWidget._getcontentPanel("simple-fill");
        thisWidget.setState({contentPanel: Panel});
      });
    });
  }

  _handleClickColorPicker(element) {
    let idColorPicker = 'colorPickerDiv_' + element.target.id.split('_')[1];
    let colorPickerElement = document.getElementById(idColorPicker);
    (colorPickerElement.style.display === 'none')
      ? colorPickerElement.style.display = 'block'
      : colorPickerElement.style.display = 'none';
  }

  _handleChangeColorPicker(idColorPicker, color) {
    let idDivPicker = 'buttonColor_' + idColorPicker.split('_')[1];
    let divPickerElement = document.getElementById(idDivPicker);
    // console.log(divPickerElement.attributes.color);
    // divPickerElement.attributes.color = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a];
    // divPickerElement.color = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a];
    divPickerElement.style.background = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
  }

  _getcontentPanel(typeSelected) {
    let stylesPoint,
      stylesLines,
      stylesPolygon,
      capLines,
      joinLines;
    stylesPoint = [
      "circle",
      "cross",
      "diamond",
      "path",
      "square",
      "x"
    ];
    stylesLines = [
      "dash",
      "dash-dot",
      "dot",
      "long-dash",
      "long-dash-dot",
      "long-dash-dot-dot",
      "none",
      "short-dash",
      "short-dash-dot",
      "short-dash-dot-dot",
      "short-dot",
      "solid"
    ];
    stylesPolygon = [
      "backward-diagonal",
      "cross",
      "diagonal-cross",
      "forward-diagonal",
      "horizontal",
      "none",
      "solid",
      "vertical"
    ];
    capLines = ["butt", "round", "square"];
    joinLines = ["miter", "round", "bevel"];
    let colorMin = {
      r: 44,
      g: 125,
      b: 253,
      a: 1
    };
    let colorMax = {
      r: 229,
      g: 0,
      b: 0,
      a: 1
    };
    let backcolorMin = {
      width: '36px',
      height: '14px',
      borderRadius: '2px',
      background: `rgba(${colorMin.r}, ${colorMin.g}, ${colorMin.b}, ${colorMin.a})`
    }
    let backcolorMax = {
      width: '36px',
      height: '14px',
      borderRadius: '2px',
      background: `rgba(${colorMax.r}, ${colorMax.g}, ${colorMax.b}, ${colorMax.a})`
    }
    const styles = {
      popover: {
        position: 'absolute',
        zIndex: '2',
        display: 'none'
      },
      cover: {
        position: 'absolute',
        zIndex: '2',
        display: 'none'
      },
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer'
      }
    }

    let response;
    switch (typeSelected) {
      case "simple-marker":
        response = (<div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(2, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={conf.initvalues.stylePoint} id="typeSymbol" className="select2container" data={stylesPoint} inputsymbolparam="stylePoint" onSelect={this._handleChangeInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(3, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={[
                  this.state.outline.styleLine,
                  this.state.outline.cap,
                  this.state.outline.join,
                  this.state.outline.miterLimit,
                  this.state.outline.width,
                  this.state.outline.lineColor
                ]} type="text" disabled="disabled" className="form-control input-Symbology outlineInput"></input>
              <div className="hideInput" onClick={() => this._handleOpenPanel(["outLinePanel", "SymbolPanel"])}></div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(4, conf)}</label>
            </div>
            <div className="col-md-6">
              <span className="span-rangeSymbology">-360</span>
              <input type="range" min="-360" max="360" defaultValue={this.state.angleValue} inputsymbolparam="angleValue" onChange={this._handleChangeInput} className="slider input-Symbology"/>
              <span className="span-rangeSymbology">360</span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(5, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.size} type="number" inputsymbolparam="size" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(6, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.xoffset} type="number" inputsymbolparam="xoffset" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(7, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.yoffset} type="number" inputsymbolparam="yoffset" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(8, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={this.state.fillColor} className="form-control button-Symbology colorInput fillColorInput" disabled="disabled"></input>
              <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  cursor: "pointer"
                }} onClick={() => this._handleOpenPanel([
                  "colorPanel", "SymbolPanel"
                ], "fill")}></div>
            </div>
          </div>
        </div>);
        break;
      case "picture-marker":
        response =  (<div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(9, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.url} type="url" inputsymbolparam="url" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(10, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.width} type="number" inputsymbolparam="width" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(11, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.height} type="number" inputsymbolparam="height" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(4, conf)}</label>
            </div>
            <div className="col-md-6">
              <span className="span-rangeSymbology">-360</span>
              <input type="range" min="-360" max="360" defaultValue={this.state.angleValue} inputsymbolparam="angleValue" onChange={this._handleChangeInput} className="slider input-Symbology"/>
              <span className="span-rangeSymbology">360</span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(6, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.xoffset} type="number" inputsymbolparam="xoffset" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(7, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.yoffset} type="number" inputsymbolparam="yoffset" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
        </div>);
        break;
      case "simple-line":
        response =  (<div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(2, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={this.state.outline.styleLine} className="select2container" data={stylesLines} inputsymbolparam="styleLine" onSelect={this._handleChangeLineInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(12, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={this.state.outline.cap} className="select2container" data={capLines} inputsymbolparam="cap" onSelect={this._handleChangeLineInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(13, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={this.state.outline.join} className="select2container" data={joinLines} inputsymbolparam="join" onSelect={this._handleChangeLineInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(14, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.outline.miterLimit} type="number" inputsymbolparam="miterLimit" onChange={this._handleChangeLineInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(10, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.outline.width} type="number" inputsymbolparam="width" step="any" onChange={this._handleChangeLineInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(8, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={this.state.outline.lineColor} className="form-control button-Symbology lineColorInput" disabled="disabled"></input>
              <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  cursor: "pointer"
                }} onClick={() => this._handleOpenPanel([
                  "colorPanel", "SymbolPanel"
                ], "line")}></div>
            </div>
          </div>
        </div>);
        break;
      case "simple-fill":
        response = (<div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(2, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={conf.initvalues.stylePolygon} id="typeSymbol" className="select2container" data={stylesPolygon} inputsymbolparam="stylePolygon" onSelect={this._handleChangeInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(3, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={[
                  this.state.outline.styleLine,
                  this.state.outline.cap,
                  this.state.outline.join,
                  this.state.outline.miterLimit,
                  this.state.outline.width,
                  this.state.outline.lineColor
                ]} type="text" disabled="disabled" className="form-control input-Symbology outlineInput"></input>
              <div className="hideInput" onClick={() => this._handleOpenPanel(["outLinePanel", "SymbolPanel"])}></div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(8, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={this.state.fillColor} className="form-control button-Symbology colorInput fillColorInput" disabled="disabled"></input>
              <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  cursor: "pointer"
                }} onClick={() => this._handleOpenPanel([
                  "colorPanel", "SymbolPanel"
                ], "fill")}></div>
            </div>
          </div>
          <div className="row margin-top10px">
            <div className="col-md-7">
              <label className="label-Symbology">{StaticDevTools._getLabel(25, conf)}</label>
            </div>
            <div className="col-md-5">
              <div className="form-group">
                <label className="radio-inline first-radio-inline"><input type="radio" name="AdvancedSymbol" value="NoSelect" onClick={e => this._handleCheckAdvancedSymbol(e.target)} defaultChecked="defaultChecked"/> {StaticDevTools._getLabel(26, conf)}
                </label>
                <label className="radio-inline"><input type="radio" name="AdvancedSymbol" value="ContinuousColor" onClick={e => this._handleCheckAdvancedSymbol(e.target)}/> {StaticDevTools._getLabel(17, conf)}
                </label>
                <label className="radio-inline"><input type="radio" name="AdvancedSymbol" value="ClassbyField" onClick={e => this._handleCheckAdvancedSymbol(e.target)}/> {StaticDevTools._getLabel(24, conf)}
                </label>
              </div>
            </div>
          </div>
          <Panel id="continousColorPanel">
            <div className="row">
              <div className="col-md-12">
                <Select2 defaultValue={this.state.fieldSelect} typesymbology="continousColor" id="fieldSelect" className="select2container" onSelect={this._changeFieldSelected} data={this.state.fields} options={{
                    placeholder: StaticDevTools._getLabel(21, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row margin-top10px">
              <div className="col-md-6">
                <label>{StaticDevTools._getLabel(19, conf)}</label>
                <input id="minValueFieldInput" placeholder={this.state.minValueField} type="text" disabled="disabled" className="form-control"></input>
                <div style={styles.swatch}>
                  <div color={colorMin} id='buttonColor_minVal' style={backcolorMin} onClick={this._handleClickColorPicker}/>
                </div>
                <div id='colorPickerDiv_minVal' style={styles.popover}>
                  <div style={styles.cover}/>
                  <SketchPicker color={colorMin} onChange={(e) => this._handleChangeColorPicker('colorPickerDiv_minVal', e)}/>
                </div>
              </div>
              <div className="col-md-6">
                <label>{StaticDevTools._getLabel(20, conf)}</label>
                <input id="maxValueFieldInput" placeholder={this.state.maxValueField} type="text" disabled="disabled" className="form-control"></input>
                <div style={styles.swatch}>
                  <div color={colorMax} id='buttonColor_maxVal' style={backcolorMax} onClick={this._handleClickColorPicker}/>
                </div>
                <div id='colorPickerDiv_maxVal' style={styles.popover}>
                  <div style={styles.cover}/>
                  <SketchPicker color={colorMax} onChange={(e) => this._handleChangeColorPicker('colorPickerDiv_maxVal', e)}/>
                </div>
              </div>
            </div>
          </Panel>
          <Panel id="symbologybyClassPanel">
            <div className="row">
              <div className="col-md-12">
                <Select2 defaultValue={this.state.fieldSelect} typesymbology="byClass" id="fieldSelect" className="select2container" onSelect={this._changeFieldSelected} data={this.state.fields} options={{
                    placeholder: StaticDevTools._getLabel(21, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row margin-top10px">
              <div className="col-md-12">
                {this.state.tableSymbologlybyClass}
              </div>
            </div>
          </Panel>
        </div>);
        break;
      case "picture-fill":
      response =  (<div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(9, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.url} type="url" inputsymbolparam="url" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(10, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.width} type="number" inputsymbolparam="width" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(11, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.height} type="number" inputsymbolparam="height" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(6, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.xoffset} type="number" inputsymbolparam="xoffset" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(7, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.yoffset} type="number" inputsymbolparam="yoffset" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(15, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.xscale} type="number" inputsymbolparam="xscale" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(16, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.yscale} type="number" inputsymbolparam="yscale" onChange={this._handleChangeInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(3, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={[
                  this.state.outline.styleLine,
                  this.state.outline.cap,
                  this.state.outline.join,
                  this.state.outline.miterLimit,
                  this.state.outline.width,
                  this.state.outline.lineColor
                ]} type="text" disabled="disabled" className="form-control input-Symbology outlineInput"></input>
              <div className="hideInput" onClick={() => this._handleOpenPanel(["outLinePanel", "SymbolPanel"])}></div>
            </div>
          </div>
        </div>);
        break;
      default:
        response =  (<div></div>);
        break;
    }

    this.setState({typeSymbol: typeSelected});

    return response;


  }

  render() {
    let geometryType,
      typeSymbol,
      stylesLines,
      capLines,
      joinLines;
    geometryType = this.state.geometryType;
    switch (geometryType) {
      case "point":
        typeSymbol = ["simple-marker", "picture-marker"];
        break;
      case "polyline":
        typeSymbol = ["simple-line"];
        break;
      case "polygon":
        typeSymbol = ["simple-fill", "picture-fill"];
        break;
      default:
      break;
    }
    stylesLines = [
      "dash",
      "dash-dot",
      "dot",
      "long-dash",
      "long-dash-dot",
      "long-dash-dot-dot",
      "none",
      "short-dash",
      "short-dash-dot",
      "short-dash-dot-dot",
      "short-dot",
      "solid"
    ];
    capLines = ["butt", "round", "square"];
    joinLines = ["miter", "round", "bevel"];
    return (<form onSubmit={this._applySymbol}>
      <div className="row">
        <div className="col-md-12 text-center">
          <Select2 defaultValue={this.state.typeSymbol} id="typeSymbol" className="select2container" onSelect={this._switchSymbolSelected} ref="typeSymbol" data={typeSymbol} options={{
              placeholder: "Seleccionar tipo simbolo",
              width: '100%'
            }}></Select2>
        </div>
      </div>
      <Panel id="SymbolPanel" className="panel-Symbology">
        {this.state.contentPanel}
        <div className="row">
          <div className="col-md-12 text-center">
            <Button className="btn btn-primary applySymbol-button" type="submit">{StaticDevTools._getLabel(1, conf)}</Button>
          </div>
        </div>
      </Panel>
      <Panel id="outLinePanel" className="panel-Symbology">
        <i className="fa fa-window-close closeIcon" onClick={this._handleButtonClosePanel}></i>
        <div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(2, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={this.state.outline.styleLine} className="select2container" data={stylesLines} inputsymbolparam="styleLine" onSelect={this._handleChangeLineInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(12, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={this.state.outline.cap} className="select2container" data={capLines} inputsymbolparam="cap" onSelect={this._handleChangeLineInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(13, conf)}</label>
            </div>
            <div className="col-md-6">
              <Select2 defaultValue={this.state.outline.join} className="select2container" data={joinLines} inputsymbolparam="join" onSelect={this._handleChangeLineInput} options={{
                  placeholder: "",
                  width: '100%'
                }}></Select2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(14, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.outline.miterLimit} type="number" inputsymbolparam="miterLimit" onChange={this._handleChangeLineInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(10, conf)}</label>
            </div>
            <div className="col-md-6">
              <input defaultValue={this.state.outline.width} type="number" inputsymbolparam="width" onChange={this._handleChangeLineInput} className="form-control input-Symbology"></input>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <label className="label-Symbology">{StaticDevTools._getLabel(8, conf)}</label>
            </div>
            <div className="col-md-6">
              <input placeholder={this.state.outline.lineColor} className="form-control button-Symbology lineColorInput" disabled="disabled"></input>
              <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  cursor: "pointer"
                }} onClick={() => this._handleOpenPanel([
                  "colorPanel", "SymbolPanel"
                ], "line")}></div>
            </div>
          </div>
        </div>
      </Panel>
      <Panel id="colorPanel" className="panel-Symbology">
        <i className="fa fa-window-close closeIcon" onClick={this._handleButtonClosePanel}></i>
        <div id="pickerFillColor" className="panel-Symbology">
          <SketchPicker color={this.state.fillcolorhex} onChange={this._handleChangeFillColor}/>
        </div>
        <div id="pickerLineColor" className="panel-Symbology">
          <SketchPicker color={this.state.linecolorhex} onChange={this._handleChangeLineColor}/>
        </div>
      </Panel>
      <Panel id="multipleColorPanel" className="panel-Symbology">
        <div className="row">
          <div className="col-md-12">
            <i className="fa fa-window-close closeIcon" onClick={this._handleButtonClosePanel}></i>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <label>{StaticDevTools._getLabel(19, conf)}</label>
            <input value={this.state.minValueField} type="text" disabled="disabled" className="form-control input-Symbology"></input>
          </div>
          <div className="col-md-6">
            <SketchPicker color={this.state.minfillcolor} onChange={this._handleChangeMinFillColor}/>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <label>{StaticDevTools._getLabel(20, conf)}</label>
            <input value={this.state.maxValueField} type="text" disabled="disabled" className="form-control input-Symbology"></input>
          </div>
          <div className="col-md-6">
            <SketchPicker color={this.state.maxfillcolor} onChange={this._handleChangeMaxFillColor}/>
          </div>
        </div>
      </Panel>
    </form>)
  }
}
