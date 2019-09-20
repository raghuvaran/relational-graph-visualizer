import 'reflect-metadata';
import { createConnection } from 'typeorm';

type StringGraph = Map<string, Set<string>>;

/**
 * Make a undirected graph and create a connection both ways
 * @param graph Graph
 */
const connectEdges = (graph: StringGraph) => {
  for (const key of graph.keys()) {
    for (const v of graph.get(key).values()) {
      graph.get(v).add(key);
    }
  }
};

const buildGraph = (mapping) => {
  const graph = new Map<string, Set<string>>();

  mapping.forEach((mapped) => {
    graph.set(mapped.primary, new Set(mapped.foreign));
  });
  connectEdges(graph);
  return graph;
};

const buildD3Graph = (graph: StringGraph) => {
  const nodes = [...graph.keys()].map((key) => ({ id: key, group: 1 }));
  const links = [];
  const visited = new Set<string>();
  for (const u of graph.keys()) {
    for (const v of graph.get(u).values()) {
      const edgeKey = `${u},${v}`;
      const reverseEdgeKey = `${v},${u}`;
      if (!visited.has(edgeKey) && !visited.has(reverseEdgeKey)) {
        links.push({
          source: u,
          target: v,
          value: 50
        });
      }
    }
  }
  return { nodes, links };
  // dfs
};

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
    const mapping = [];
    for (const table of tables) {
      const tableName = keywordSet.has(table) ? `"${table}"` : table;
      const constraints = await connection.query(
        `show constraints from ${tableName}`
      );
      const constraintsFilteredByForeignAndPrimary = constraints.filter(
        (constraint) =>
          constraint.constraint_type.indexOf('FOREIGN') !== -1 ||
          constraint.constraint_type.indexOf('PRIMARY') !== -1
      );

      // console.log(constraintsFilteredByForeignAndPrimary);
      // console.log(constraintsFilteredByForeignAndPrimary.length);
      // initialize array
      const constraintMap = { primary: '', foreign: [] };
      // console.log(constraintArr);
      constraintsFilteredByForeignAndPrimary.forEach((constraint) => {
        // console.log('before', {
        //   index,
        //   details: constraint.details,
        //   obj: constraintArr[index]
        // });
        if (constraint.details.indexOf('FOREIGN') !== -1) {
          constraintMap.foreign.push(constraint.details.split(' ')[4]);
        } else {
          constraintMap.primary = tableName;
        }
        // console.log('after', {
        //   obj: constraintArr[index]
        // });
      });
      // console.log(constraintMap);
      mapping.push(constraintMap);
      // buildGraph(constraintsMapping);
      // constraints.map((constraint) => console.log(constraint));
      // edges.push(constraints.map((constraint) => console.log(constraint))
    }
    const graph = buildGraph(mapping);
    const d3Graph = buildD3Graph(graph);
    console.log(JSON.stringify(d3Graph, null, 2));
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
