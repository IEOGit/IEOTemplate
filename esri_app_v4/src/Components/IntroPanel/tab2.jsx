
import React from 'react';

export default class Tab2 extends React.Component{
  render (){
    return <div>
      <img className="imgLogo marg-top-20px" alt="Logo IEO"/>
            <p>Visor de información marina que muestra información de la naturaleza del fondo, batimetría,límites de reservas, información ambiental, caladeros de pesca, arrecifes artificiales y límites administrativos,(a título meramente informativo y sin validez legal).</p>
            <p>Desarrollado con <a className="alink" href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">ReactJS</a> de Facebook y la librería de mapas <a className="alink" href="https://developers.arcgis.com/javascript/" target="_blank" rel="noopener noreferrer">API para Javascript 4</a> de ESRI</p>
            <p>Más información:
              <br/>
              <a className="alink" href="http://www.ideo-base.ieo.es/" target="_blank" rel="noopener noreferrer">IEO</a>
              <br/>
              <a className="alink" href="http://www.geo-ideo.ieo.es/geoportalideo/catalog/main/home.page" target="_blank" rel="noopener noreferrer">IDEO</a>
            </p>
          </div>
  }
}
