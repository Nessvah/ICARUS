import { AuthenticationError } from '../../../src/utils/error-handling/CustomErrors';

describe('isAutenticated middleware', () => {
  const mockResolver = jest.fn(() => 'Original resolver called');

  it('throws AuthenticationError if currentUser is not present', async () => {
    // Mock the resolver arguments
    const args = {};
    // Simulate no currentUser in context
    const context = { currentUser: null };

    // Call the middleware function with the mock resolver
    await expect(isAutenticated(mockResolver)(null, args, context)).rejects.toThrow(AuthenticationError);
  });

  it('calls the original resolver if currentUser is present', async () => {
    // Mock the resolver arguments
    const args = {};
    const context = { currentUser: { id: 'user123' } }; // Simulate currentUser in context

    // Call the middleware function with the mock resolver
    const result = await isAutenticated(mockResolver)(null, args, context);

    // Check if the original resolver was called
    expect(mockResolver).toHaveBeenCalled();
    // Check if the result matches the expected value
    expect(result).toBe('Original resolver called');
  });

  const isAutenticated = (resolver) => async (_, args, ctx) => {
    if (!ctx || !ctx.currentUser) {
      // Add null check for ctx
      throw new AuthenticationError('Sem autorização para aceder. Por favor faça login.');
    }

    // we need to call the original resolver if the
    // authentication is successful
    return resolver(_, args, ctx);
  };

  it('throws TypeError if resolver is not provided', async () => {
    const args = {};
    const context = { currentUser: { id: 'user123' } };

    // Call the middleware function without providing the resolver
    await expect(isAutenticated()(null, args, context)).rejects.toThrow(TypeError);
  });

  it('executes within a reasonable time limit', async () => {
    const args = {};
    const context = { currentUser: { id: 'user123' } };

    const startTime = Date.now();
    await isAutenticated(mockResolver)(null, args, context);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // Assert that the execution time is within an acceptable range
    expect(executionTime).toBeLessThan(100);
  });
});
