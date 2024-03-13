## ImportThemTities (class)

This Node.js script imports data from JSON files into a database. It uses the `fs` module to read files and the `path` module to manipulate file paths.

### Step-by-Step Explanation

1. **Initialization**:

   - The `ImportThemTities` class is defined with a constructor that initializes the `__dirname` property to the directory of the current script.

2. **Importing All**:
   - The `importAll` method is defined to perform the import process.
   - It starts by reading all connection files from the `db` folder.
   - Then, it reads database information from each connection file and stores it in a `databaseInfo` object.
   - Next, it reads entities files from the `entities` folder.
   - For each entities file, it reads the JSON data and parses it.
   - It associates database information with table information and creates a `tableInfo` object for each table.
   - Finally, it logs the `tables` array to the console.

### Usage

- Create an instance of the `ImportThemTities` class.
- Call the `importAll` method to start the import process.

### Example

```javascript
const importer = new ImportThemTities();
importer.importAll();
```

### Conclusion

The ImportThemTities script streamlines the process of importing data into a database from JSON files. With its modular design and clear workflow, it provides an efficient solution for handling database imports, making it a valuable tool for developers working with Node.js applications. Whether for one-time data migrations or regular data updates, ImportThemTities offers a robust and flexible solution for managing database imports.
