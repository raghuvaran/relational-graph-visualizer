import React, { Component } from 'react';
import 'vis-network/dist/vis-network.min.css';
import { DataSet, Network } from "vis-network";

export default class Schema extends Component {
  addNode = (...args) => {
    console.log("add node", args)
  }
  addEdge = (...args) => {
    console.log("add edge", args)
  }
  editNode = (...args) => {
    console.log("edit node", args)
  }
  editEdge = (...args) => {
    console.log("edit edge", args)
  }

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
    const { addNode, addEdge, editNode, editEdge } = this;
    const network = new Network(chart, data, {
      manipulation: {
        enabled: true,
        addNode: function (data, callback) {
          // filling in the popup DOM elements
          // document.getElementById('node-operation').innerHTML = "Add Node";
          addNode(this, data, arguments, callback);
        },
        addEdge,
        editNode: function () { console.log("inline editing node", ...arguments) },
        editEdge
      }
    })
    // network.on('click')
    return network;
  }

  componentDidMount() {
    console.log("chart", this.chart)
    this.network = this.createChart(this.chart);
    console.log("network", this.network);
  }

  render() {
    return (
      <div style={{ height: 700 }} ref={element => { this.chart = element }}></div>
    );
  }
}
