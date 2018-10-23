import React from 'react';
import './IntroPanel.css';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';
import { Tabs } from 'react-bootstrap';
import { Tab } from 'react-bootstrap';
// import { Popover } from 'react-bootstrap';
// import { Tooltip } from 'react-bootstrap';
//import { OverlayTrigger } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

const conf = require('./widgetconfig.json');

const recordar = localStorage.getItem('_recordar');
export default class IntroPanel extends React.Component {

  constructor(props) {
    super(props);
    this.handleShow = this.handleShow.bind(this);
		this.handleClose = this.handleClose.bind(this);
    if (recordar === "true")
    {
      this.state = { showModal: false };
    }
    else{
      this.state = { showModal: true };
    }
  }


  handleClose(e) {
    if (typeof e !== "undefined" && e.target.id === "agree" && $("#recordar").val() === "on"){
       localStorage.setItem('_recordar', "true");
    }

		this.setState({ showModal: false });
	}
	handleShow() {
		this.setState({ showModal: true });
	}

  render(){

    let tabs = conf.Tabs.map(function(tab, i){
      let Tabcontent = require('./' + tab.htmlContentFile).default;
      return <Tab key={i} eventKey={i} title={tab.title} ><Tabcontent /></Tab>;
    });


    return(
      <div className='IntroPanel'>
        <Modal show={this.state.showModal} onHide={this.handleClose}>
					<Modal.Header closeButton>
            <Modal.Title></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs defaultActiveKey={conf.activeTab} id="IntropPanelTabs">
              {tabs}
            </Tabs>
					</Modal.Body>
					<Modal.Footer>
            <label htmlFor="recordar" style={{padding:'10px'}}>Rercordar </label><input type="checkbox" id="recordar" className="inputRecordar" defaultChecked></input>
            <Button id="agree" className="buttonIntroPanel" onClick={this.handleClose}>Aceptar | Agree</Button>
            <Button id="disagree" className="buttonIntroPanel buttonIntroPanel-Right" onClick={this.handleClose}>No Aceptar | Disagree</Button>
					</Modal.Footer>
				</Modal>
      </div>
    );
  }
}
