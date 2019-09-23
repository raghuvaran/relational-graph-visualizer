import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { SQLGraph } from './Graph';

createConnection()
  .then(async (connection) => {
    console.log('Here you can setup and run express/koa/any other framework.');
    const graph = new SQLGraph(connection);
    await graph.setup();
    console.log(graph.buildVisJsTableGraph());
    connection.close();
  })
  .catch((error) => console.log(error));
