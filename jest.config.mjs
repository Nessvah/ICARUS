export default {
  transform: {
    // Transpile files with Babel Jest, targeting .js and .jsx files
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules', 'src', 'icarus-core'],
  testEnvironment: 'node',
};
