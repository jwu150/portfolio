import React, { Component } from 'react';
import { Container, Row, Col, Input, Button } from 'reactstrap';
import './App.css';

export default class Portfolio extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      update: true,
      inEdit: false
    };
    this.quoteMap = new Map();
    this.deleteQuote = this.deleteQuote.bind(this);
    this.editQuote = this.editQuote.bind(this);
    this.getQuote = this.getQuote.bind(this);
  }

  handleKeyPress = (e) => {
    if (e.key == 'Enter') {
      this.updatePortfolio();
    } 
  }

  editQuote(e)  {
    e.preventDefault();
    const symbol = e.target.name;
    
    this.setState({ inEdit: true });
    document.getElementById('symbol').focus();

    const quoteObj = this.quoteMap.get(symbol);
  
    document.getElementById('symbol').value = symbol;
    document.getElementById('price').value = quoteObj.price;
    document.getElementById('qty').value = quoteObj.qty;
    document.getElementById('date').value = quoteObj.date;
  }

  deleteQuote(e) {
    e.preventDefault();
    this.quoteMap.delete(e.target.name);
    this.setState({ update: !this.state.update });
  }
  
  updatePortfolio = () => {
    const price = document.getElementById('price').value;
    const qty = document.getElementById('qty').value;
    const date = document.getElementById('date').value;
    let symbol =  document.getElementById('symbol').value;

    if (!symbol || !qty || !price) {
      alert('one or more required fields are missing');
      return;
    }

    symbol = symbol.toUpperCase(); // need to do this for map key

    this.quoteMap.set(symbol, {
      price: price,
      qty: qty,
      date: date,
      quote: undefined
    });

    this.getQuote(this.quoteMap.keys());
  }

  getQuote(symbols) {
    let queryStr = '';

    for (const key of symbols) {
      queryStr = queryStr + 'NASDAQ:' + key + ',';  // TODO: this leaves commas at the end, use template or push  
    }
    
    const url = `http://finance.google.com/finance/info?q=${queryStr}`;
    const me = this; // TODO: maybe anti pattern
    
    return fetch(url)
      .then(res => res.text())
      .then((text) => {
        if (text) {
          const quotes = JSON.parse(text.substring(4, text.length));

          for (let i = 0; i < quotes.length; i++) {
            Object.assign(me.quoteMap.get(quotes[i].t), { quote: quotes[i].l });
          }
          me.setState({ update: !me.state.update, inEdit: false });
        }
    });
    // add error handling
  }

  render() {
    const rows = [];
    const me = this;
    const NumberFormat = require('react-number-format');
    const { inEdit } = this.state;

    const modeClsName = inEdit ? 'EditMode' : 'ReadMode';

    this.quoteMap.forEach(function(value, key) {
      const basis = value.price * value.qty;
      const gains = value.qty * ( value.quote - value.price );
      const gainLoss = gains > 0 ? 'gains': 'losses';
      const clsName = `row2 ${gainLoss}`;
      rows.push(
        <Row key={ key }>
          <Col xs="3">
            <Button color="success" name={ key } onClick={ me.editQuote } >Edit</Button> <Button name={ key } color="danger" onClick={ me.deleteQuote } >Delete</Button>
          </Col>
          <Col>
            { key } /  <NumberFormat value={ value.qty } displayType={'text'} thousandSeparator={true} /> * 
            <NumberFormat value={ value.price } displayType={'text'} thousandSeparator={true} prefix={'$'} /> = 
            <NumberFormat value={ basis } displayType={'text'} thousandSeparator={true} decimalPrecision={0} prefix={'$'} /> / { value.date }
            <div className={ clsName }>
              <NumberFormat value={ value.quote } displayType={'text'} thousandSeparator={true} prefix={'$'} /> / 
              <NumberFormat value={ gains } displayType={'text'} thousandSeparator={true} decimalPrecision={0} prefix={'$'} />
            </div>
          </Col>
        </Row>);
      });

    return (
      <div>
       <Container onKeyPress={ this.handleKeyPress } >
          <Row>
            <Col xs="12" className="title"><h3>Portfolio</h3></Col>
            <br />
          </Row>
          <Row className={ modeClsName }>
            <Col xs="auto"><Input className="symbolInput" type="text" name="symbol" id="symbol" placeholder="Symbol" /></Col>
            <Col xs="2"><Input type="number" name="price" id="price" placeholder="Price" /></Col>
            <Col xs="2"><Input type="number" name="qty" id="qty" placeholder="Qty" /></Col>
            <Col xs="3"><Input  type="text" name="date" id="date" placeholder="DD/MM/YYYY" /></Col>
            <Button color="info" onClick={ this.updatePortfolio } >+</Button>
          </Row>
          { rows }  
        </Container>
      </div>
    );
  }
};