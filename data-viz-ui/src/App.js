import React, { Component } from 'react';
import './App.css';
import * as d3 from "d3";

class App extends Component {
  /**
   * 
   * @param {d3.Selection<SVGScriptElement>} svg 
   */
  createChart = (svg) => {
    const data = {
      nodes: [
        { id: "Myriel", group: 1 },
        { id: "Napoleon", group: 1 }
      ],
      links: [
        { source: "Napoleon", target: "Myriel", value: 1 }
      ]
    };
    const width = 960;
    const height = 600;
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    const color = (d) => scale(d.group);
    const drag = simulation => {

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    // const svg = d3.create("svg")
    svg.attr("viewBox", [0, 0, width, height]);

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("g");
    node.append("circle")
      .attr("r", 5)
      .attr("fill", color)
      .call(drag(simulation));

    node.append("text")
      .attr('x', 6)
      .attr('y', 3)
      .text(d => d.id);

    node.append("title")
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      //TODO: trasform is creating a blury effect when draging the nodes
      node
        .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
      //TRADEOFF: When not using `g` element to wrap the circle and text, we can use `cx`, `cy` to align the circle; It works fine
      // .attr("cx", d => d.x)
      // .attr("cy", d => d.y);
    });

    // stdlib.invalidation.then(() => simulation.stop());
  };
  componentDidMount() {
    this.createChart(this.svg);
  }

  render() {
    return (
      <div className="App">
        <svg width="960" height="600" ref={element => { this.svg = d3.select(element); }}></svg>
      </div>
    );
  }
}

export default App;
