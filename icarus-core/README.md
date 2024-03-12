# Icarus2

## NPM

`npm icarus-graphql`

## Create a Config Folder

Create a `config` folder, them inside this folder, create a `db` and a `entities` folder.
Inside of the `db` folder you will add the data base configuration in a json file.
Inside of the `entities` folder you will add the tables information in a json file.

```
-config
  -db
    mongodb.json
    mysql.json
  -entities
    authors.json
    blog_posts.json
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

## Server Example

```bash
import express from "express";
import cors from "cors";
import { startGraphqlServer } from "icarus-graphql"; //--- import startGraphqlServer, to use the graphql configured server.
import { expressMiddleware } from "@apollo/server/express4"; //--- Use the expressMiddleware to use the graphql Server as a middleware.

const app = express();

app.use(cors());
app.use(express.urlencoded());

const server = await startGraphqlServer("./config") //---- when you create the server, you have to pass the path to the `config` folder, to generate the graphql server, based on the config files.

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

## Team Members

- [Eliana Delgado](https://github.com/EssDelgado)
- [Pedro Maldonado](https://github.com/pedro-afm)
- [Sílvia Costa](https://github.com/Nessvah)
- [Susana Silva](https://github.com/Su401)
- [Willian Fischer](https://github.com/WillianFischer)
