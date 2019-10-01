import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { SQLGraphBuilder } from './sql/sql_graph_builder';
import { VisNetworkBulider } from './vis_js/vis_network_builder';

createConnection()
  .then(async (connection) => {
    console.log('Here you can setup and run express/koa/any other framework.');
    const graph = await new SQLGraphBuilder().build();
    console.log(VisNetworkBulider.toJson(graph));
    connection.close();
  })
  .catch((error) => console.log(error));
