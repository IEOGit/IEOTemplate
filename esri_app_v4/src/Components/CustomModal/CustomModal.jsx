import React from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import './CustomModal.css';

const conf = require('./widgetconfig.json');

export default class CustomModal extends React.Component {

  constructor(props) {
    super(props);
    this.handleShow = this.handleShow.bind(this);
		this.handleClose = this.handleClose.bind(this);
    this.state = {
      showModal: this.props.showModal,
      labels:conf.labels
    }
  }

  handleClose(e) {
		this.setState({ showModal: false });
	}
	handleShow() {
		this.setState({ showModal: true });
	}

  componentWillReceiveProps(newProps) {
    this.setState({showModal: newProps.showModal});
  }

  render(){
    return(
      <Modal id="myModal" show={this.state.showModal} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.headerTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.bodyModal}
        </Modal.Body>
        <Modal.Footer>
          <Button id="cancel-btn" onClick={this.handleClose}>{StaticDevTools._getLabel(0,conf)}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
