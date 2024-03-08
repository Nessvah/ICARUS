import fs from 'fs';
import { addUserFunction } from './hooks.js';
//import { beforeResolver } from './beforeResolver';

const myHook = async (table, args) => {
  // Path to find the entity
  const filePath = `config/entities/${table}.json`;

  if (fs.existsSync(filePath)) {
    // Taking the entity data in string
    const tableDataString = fs.readFileSync(filePath, 'utf-8');
    // Transforming the string document into an object
    const tableData = JSON.parse(tableDataString);

    // Verifying if exists hooks in this entity
    const { hooks } = tableData.tables;

    // Taking the operation "_create, _update, _delete"
    const operationArray = Object.keys(args.input);

    const operation = operationArray[0];

    if (hooks && hooks[operation]) {
      const functionName = hooks[operation];
      eval(functionName + `(${table}, ${args})`);
    }
  }
};

export { myHook };
