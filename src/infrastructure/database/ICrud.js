/* eslint-disable no-unused-vars */

//* This is what's so called a contract

/**
 * Abstract class representing common CRUD (Create, Read, Update, Delete) operations.
 * Subclasses are expected to implement specific functionality for each operation.
 *
 * @class ICrud
 * @throws {TypeError} if instantiated directly, as abstract classes should only be
 * extended.
 */

class ICrud {
  constructor() {
    // check if someone is trying to instantiate thid
    // abstract class
    if (new.target === ICrud) {
      // Throw an error to prevent instantiation of the abstract class
      throw new TypeError('Cannot instantiate abstract class.');
    }
  }

  async connect() {
    // When a subclass extends a class containing such a method,
    // it is required to provide its own implementation
    // otherwise it will thrown an error at runtime
    throw new Error('Method not implemented.');
  }

  stop() {
    throw new Error('Method not implemented.');
  }

  async find(args) {
    throw new Error('Method not implemented.');
  }

  async update(args) {
    throw new Error('Method not implemented.');
  }

  async create(args) {
    throw new Error('Method not implemented.');
  }

  async delete(args) {
    throw new Error('Method not implemented.');
  }
}
