import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { SQLGraph } from './Graph';

createConnection()
  .then(async (connection) => {
    console.log('Here you can setup and run express/koa/any other framework.');
    const graph = new SQLGraph(connection);
    await graph.setup();
    // console.log(graph.buildVisJsTableGraph());
    console.log(await graph.traverse('subscriber', [{ name: 'Honeywell' }]));
    // await graph.getRowsFromTableQuery('subscriber', [{ name: 'Honeywell' }]);
    // await graph.getRowsFromTableQuery('data_filter', [
    //   { subscriber_uuid: 'f426c434-fce1-4506-a06d-01db7b9c7e78' }
    // ]);
    // await graph.getRowsFromTableQuery('user', [
    //   { subscriber_uuid: 'f426c434-fce1-4506-a06d-01db7b9c7e78' }
    // ]);
    // await graph.getRowsFromTableQuery('role', [
    //   { subscriber_uuid: 'f426c434-fce1-4506-a06d-01db7b9c7e78' }
    // ]);

    // await graph.getRowsFromTableQuery('user_group', [
    //   { subscriber_uuid: 'f426c434-fce1-4506-a06d-01db7b9c7e78' }
    // ]);

    // await graph.getRowsFromTableQuery('user_group', [
    //   { subscriber_uuid: 'f426c434-fce1-4506-a06d-01db7b9c7e78' }
    // ]);
    connection.close();
  })
  .catch((error) => console.log(error));
