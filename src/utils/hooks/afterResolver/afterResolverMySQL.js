/**
 * Constructor for MongoDBConnection class.
 * @param {Array} res - The array with responses.
 * @returns {<object[]>} - Modified args or same args.
 */
const afterResolverMySQL = async (res) => {
  try {
    // Check if any documents were found
    if (res) {
      // Iterate over each document
      res.forEach((element) => {
        if (element._id) {
          // Update the _id field with an ObjectID
          const id = element._id;
          delete element._id; // Remove the _id field
          element.id = id; // Add an id field with the previous _id value
        }
      });
      return res; // Return the updated documents
    } else {
      return false; // Return false if no documents were found
    }
  } catch (error) {
    throw new Error(error);
  }
};

export { afterResolverMySQL };
