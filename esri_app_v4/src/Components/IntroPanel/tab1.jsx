import React from 'react';

export default class Tab1 extends React.Component {
  render() {
    return <div>
      <div className="divImgLogo"><img className="imgLogo" alt="Logo IEO"/></div>
      <h4>Visor Cartografía Base del I.E.O</h4>
      <p>Todos los derechos de Propiedad Intelectual de la información corresponden al IEO, conforme a lo dispuesto en la Ley de Propiedad Intelectual 23/2006, 7 de julio, aprobada por Real Decreto Legislativo 1/1996, de 12 de abril.
      </p>
      <p>No usar los datos e información contenida en este Visor específico en cualquier trabajo derivado, publicación, producto, o aplicación comercial, sin el consentimiento escrito del proveedor original de los datos e información.<span className="spanEnglish">
          | Not to use data and information contained in this specific geoportal in any derivative work, publication, product, or commercial application without prior written consent of the original data provider.</span>
      </p>
      <p>Se citará al Instituto Español de Oceanografía en la bibliografía de todos aquellos documentos, páginas web y medios digitales en los que se incluya toda o parte de la información que aquí aparece
        <span className="spanEnglish">
          | The Instituto Español de Oceanografía must be cited at any document, webpage and other digital support, in which some part or all information here exposed, is included</span>
      </p>
      <p>El visor puede ser citado como sigue:
        <span className="spanEnglish">
          | The Viewer can be cited as follows:</span>
      </p>
      <p>
        * IEO (Instituto Español de Oceanografía), 2013.
        <a href="http://www.ideo-base.ieo.es/" target="_blank" rel="noopener noreferrer">Visor de Información Marina del IEO.</a>
      </p>
      <ul>
        <li>Instituto Español de Oceanografía
          <a href="http://www.ideo-base.ieo.es/" target="_blank" rel="noopener noreferrer">IEO</a>
        </li>
        <li>Infraestructura de datos espaciales del IEO
          <a href="http://www.geo-ideo.ieo.es/geoportalideo/catalog/main/home.page" target="_blank" rel="noopener noreferrer">IDEO</a>
        </li>
      </ul>
    </div>
  }
}
