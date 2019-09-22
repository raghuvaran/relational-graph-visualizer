import React, { Component } from 'react';
import './App.css';
import { DataSet, Network } from "vis-network";

class App extends Component {

  createChart(chart) {
    const data = {
      nodes: new DataSet([
        { id: "Myriel", label: "Myriel" },
        { id: "Napoleon", label: "Napoleon" }
      ]),
      edges: new DataSet([
        { from: "Napoleon", to: "Myriel" }
      ])
    };
    new Network(chart, data, {})
  }

  componentDidMount() {
    console.log("chart", this.chart)
    this.createChart(this.chart);
  }

  render() {
    return (
      <div className="App">
        <div style={{ height: 700 }} ref={element => { this.chart = element }}></div>
      </div>
    );
  }
}

export default App;
