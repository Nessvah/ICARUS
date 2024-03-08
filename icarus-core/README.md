# Icarus2

## NPM

`npm icarus-graphql`

## Server Example

```bash
import express from "express";
import cors from "cors";
import { server } from "icarus-graphql"; //--- import icarus server, to use the graphql configured server.
import { expressMiddleware } from "@apollo/server/express4"; //--- Use the expressMiddleware to use the graphql Server as a middleware.

const app = express();

app.use(cors());
app.use(express.urlencoded());


app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: ({ req }) => {
      return { id: 1 }; //--- Any type of authentication can go here.
    },
  })
);

app.listen(3005, () => {
  console.log("server On");
});
```

## Create tables and Database Configuration.

To create tables that have any relation to other tables, it's mandatory to create all together in the same request, as the example bellow.
In case the table don't have any relations to other tables, you can add it to the system alone, but you still have to put the configuration on the `settings`, inside of a array `[]`.

```bash
import express from "express";
import cors from "cors";
import {
  server,
  createTables, //--- import the createTables to config new tables to the graphql server.
  createDbConnection, //--- import the createDbConnection to config new database connections to the graphql server.
} from "icarus-graphql";
import { expressMiddleware } from "@apollo/server/express4";

const app = express();

app.use(cors());
app.use(express.urlencoded());

app.use("/admin/createTables", async (req, res, next) => {
  const configuration = await createTables({
    settings: [
      {
        tables: {
          name: "authors",
          database: "mongodb",
          columns: [
            {
              name: "id",
              type: "id",
              primaryKey: true,
              nullable: false,
            },
            {
              name: "name",
              type: "string",
              nullable: false,
            },
            {
              name: "email",
              type: "string",
              nullable: false,
            },
            {
              name: "id",
              type: "object",
              nullable: false,
              isObject: true,
              relationType: "1:n",
              foreignEntity: "blog_posts",
              foreignKey: "author_id",
            },
          ],
          backoffice: {
            icon: "FaIdCardAlt",
          },
        },
      },
      {
        tables: {
          name: "blog_posts",
          database: "mongodb",
          columns: [
            {
              name: "id",
              type: "id",
              primaryKey: true,
              nullable: false,
            },
            {
              name: "title",
              type: "string",
              nullable: false,
            },
            {
              name: "author_id",
              type: "id",
              nullable: false,
              isObject: true,
              relationType: "n:1",
              foreignEntity: "authors",
              foreignKey: "id",
            },
            {
              name: "content",
              type: "array",
              nullable: false,
            },
            {
              name: "publish_date",
              type: "date",
              nullable: false,
            },
          ],
          backoffice: {
            icon: "FaEdit",
          },
        },
      },
    ],
  });
  res.send(configuration);
  next();
});

app.use("/admin/createDbConnection", async (req, res, next) => {
  const configuration = await createDbConnection({
    connectConfig: {
      "type": "mongodb",
      "uri": "mongodb+srv://<username>:<password>@cluster.mongodb.net/",
      "databaseName": "<databaseName>"
    }
  });
  res.send(configuration);
  next();
});

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: ({ req }) => {
      return { id: 1 };
    },
  })
);

app.listen(3005, () => {
  console.log("server On");
});

```

## Delete Tables and database configurations

```bash
import express from "express";
import cors from "cors";
import {
  server,
  deleteTables, //--- import the deleteTables to delete a table config from the icarus graphql server.
  deleteDbConnection, //--- import the deleteDbConnection to delete a database connections from the icarus graphql server.
} from "icarus-graphql";
import { expressMiddleware } from "@apollo/server/express4";

const app = express();

app.use(cors());
app.use(express.urlencoded());

app.use("/admin/deleteTables", async (req, res, next) => {
  const deleteConfig = await deleteTables({
    settings: { name: "author" },
  });
  res.send(deleteConfig);
  next();
});

app.use("/admin/deleteEntities", async (req, res, next) => {
  const deleteConfig = await deleteDbConnection({
    connectConfig: { type: "mongodb" },
  });
  res.send(deleteConfig);
  next();
});

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: ({ req }) => {
      return { id: 1 };
    },
  })
);

app.listen(3005, () => {
  console.log("server On");
});

```

### MongoDB Table Example

```bash
{
  "tables": {
    "name": "authors",
    "database": "mongodb",
    "columns": [
      {
        "name": "id",
        "type": "id",
        "primaryKey": true,
        "nullable": false
      },
      {
        "name": "name",
        "type": "string",
        "nullable": false
      },
      {
        "name": "email",
        "type": "string",
        "nullable": false
      },
      {
        "name": "id",
        "type": "object",
        "nullable": false,
        "isObject": true,
        "relationType": "1:n",
        "foreignEntity": "blog_posts",
        "foreignKey": "author_id"
      }
    ],
    "backoffice": {
      "icon": "FaIdCardAlt"
    }
  }
}

```

### MongoDB DB Connection Example

```bash
{
    "type": "mongodb",
    "uri": "mongodb+srv://<username>:<password>@cluster.mongodb.net/",
    "databaseName": "<databaseName>"
}
```

---

### MySql table Example

```bash
{
  "tables": {
    "name": "customers",
    "database": "mysql",
    "columns": [
      {
        "name": "customer_id",
        "type": "int",
        "primaryKey": true,
        "nullable": false,
        "defaultValue": null,
        "columnType": "int",
        "extra": "auto_increment"
      },
      {
        "name": "customer_name",
        "type": "string",
        "primaryKey": false,
        "nullable": false,
        "defaultValue": null,
        "columnType": "string",
        "extra": ""
      },
      {
        "name": "email",
        "type": "string",
        "primaryKey": false,
        "nullable": false,
        "defaultValue": null,
        "columnType": "string",
        "extra": ""
      },
      {
        "name": "icon_class",
        "type": "string",
        "primaryKey": false,
        "nullable": true,
        "defaultValue": "'FaUsers'",
        "columnType": "string",
        "extra": ""
      },
      {
        "name": "icon_label",
        "type": "string",
        "primaryKey": false,
        "nullable": true,
        "defaultValue": "'Customer'",
        "columnType": "string",
        "extra": ""
      },
      {
        "name": "orders",
        "type": "object",
        "primaryKey": false,
        "nullable": true,
        "defaultValue": null,
        "columnType": "object",
        "extra": "MUL",
        "isObject": true,
        "relationType": "1:n",
        "foreignEntity": "orders",
        "foreignKey": "customer_id"
      }
    ],
    "backoffice": {
      "icon": "FaHandshake"
    }
  }
}

```

### MySql DB Connection Example

```bash
{
    "type": "mysql",
    "host": "<host>",
    "port": <port>,
    "user": "<username>",
    "password": "<password>",
    "databaseName": "<databaseName>"
}

```

## Team Members

- [Eliana Delgado](https://github.com/EssDelgado)
- [Pedro Maldonado](https://github.com/pedro-afm)
- [Sílvia Costa](https://github.com/Nessvah)
- [Susana Silva](https://github.com/Su401)
- [Willian Fischer](https://github.com/WillianFischer)
