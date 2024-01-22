import resolvers from '../../presentation/ShipmentResolvers';

// experimental test for getShipmentById
describe('getShipmentById', () => {
  it('should return a shipment for a valid ID', () => {
    const _id = '1';
    const result = resolvers.Query.getShipmentById(null, { _id });
    expect(result).toBeDefined();
    expect(result._id).toBe(_id);
  });

  it('should throw an error for an invalid ID', () => {
    const _id = 'invalid_id';
    expect(() => {
      resolvers.Query.getShipmentById(null, { _id });
    }).toThrow(`Shipment with ID ${_id} not found`);
  });
});
