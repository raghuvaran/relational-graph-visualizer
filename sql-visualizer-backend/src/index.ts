import 'reflect-metadata';
import { createConnection } from 'typeorm';

createConnection()
  .then(async (connection) => {
    console.log('Here you can setup and run express/koa/any other framework.');
    const keywords = (await connection.query(
      'select * from pg_get_keywords()'
    )).filter((keyword) => keyword.catcode === 'R');
    const keywordSet = new Set(keywords.map((keyword) => keyword.word));
    const res = await connection.query('show tables');
    const tables = res.map((table) => table.table_name);
    const edges = [];
    for (const table of tables) {
      const tableName = keywordSet.has(table) ? `"${table}"` : table;
      const constraints = await connection.query(
        `show constraints from ${tableName}`
      );
      const constraintsFilteredByForeginAndPrimary = constraints.filter(
        (constraint) =>
          constraint.constraint_type.indexOf('FOREIGN') !== -1 ||
          constraint.constraint_type.indexOf('PRIMARY') !== -1
      );

      const constrainsMapping = constraintsFilteredByForeginAndPrimary.map(
        (constraint) =>
          constraint.details.indexOf('FOREIGN') !== -1
            ? {
                // TODO hard coding right now change it to something else
                foreign: constraint.details.split(' ')[4]
              }
            : { primary: constraint.table_name }
      );
      console.log(constrainsMapping);

      // constraints.map((constraint) => console.log(constraint));
      // edges.push(constraints.map((constraint) => console.log(constraint))
    }
    console.log(edges);
    // // console.log("Inserting a new user into the database...");
    // // const user = new User();
    // // user.firstName = "Timber";
    // // user.lastName = "Saw";
    // // user.age = 25;
    // // await connection.manager.save(user);
    // console.log("Saved a new user with id: " + user.id);

    // console.log("Loading users from the database...");
    // const users = await connection.manager.find(User);
    // console.log("Loaded users: ", users);
    connection.close();
  })
  .catch((error) => console.log(error));

// constraint.filter((con) => con.constraint_type.toLocaleLowerCase().indexOf('foreign') !== -1 || con.constraint_type.toLocalLowerCase().indexOf('primary') !== -1)));
