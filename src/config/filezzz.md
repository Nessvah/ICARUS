# Entity Management System (CRUD)

This is a Node.js module that provides CRUD (Create, Read, Update, Delete) operations for managing entities stored in JSON files. The module uses the file system to store and retrieve entities, and provides a simple API for interacting with the data.

## Usage

To use the module, import it into your Node.js project and call the appropriate functions to perform CRUD operations on entities.

Here's an example of how to use the module to create a new entity:

```javascript
import { createEntity, updateEntity, deleteEntity, getEntityById, getAllEntities } from 'filezzz';

// Example entity data
const entity = {
  id: '1',
  name: 'John Doe',
  age: 30,
};

// Create a new entity
createEntity('users', entity).then((createdEntity) => {
  console.log('Entity created:', createdEntity);
});

// Update an existing entity
const entityIdToUpdate = '1';
const updatedData = { age: 31 };
updateEntity('users', entityIdToUpdate, updatedData).then((updatedEntity) => {
  console.log('Entity updated:', updatedEntity);
});

// Delete an entity
const entityIdToDelete = '1';
deleteEntity('users', entityIdToDelete).then((result) => {
  console.log('Entity deleted:', result);
});

// Get an entity by ID
const entityIdToGet = '1';
getEntityById('users', entityIdToGet).then((retrievedEntity) => {
  console.log('Retrieved entity:', retrievedEntity);
});

// Get all entities
getAllEntities('users').then((entities) => {
  console.log('All entities:', entities);
});
```

## API

The module exports the following functions:

- `getEntityById(id)`: Gets an entity by its ID.
- `getAllEntities()`: Gets all entities.
- `createEntity(entity)`: Creates a new entity.
- `updateEntity(id, updates)`: Updates an existing entity.
- `deleteEntity(id)`: Deletes an entity.

## Implementation Details

The module uses the file system to store and retrieve entities. Each entity is stored in a separate JSON file within a folder corresponding to its entity name.

When an entity is created, the module creates a new JSON file with the entity's ID inside the corresponding entity folder and writes the entity data to the file. When an entity is updated, the module reads the existing JSON file, merges the updates with the existing data, and writes the updated data back to the file. When an entity is deleted, the module deletes the corresponding JSON file.

The module also provides a simple API for interacting with the data. The API functions are designed to be easy to use and understand, and they provide a consistent way to perform CRUD operations on entities.

## Conclusion

This module provides a simple and efficient way to manage entities stored in JSON files. The module is easy to use and understand, and it provides a consistent way to perform CRUD operations on entities.
