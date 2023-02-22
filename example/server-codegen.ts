import type { CodegenConfig } from '@graphql-codegen/cli';

const server: CodegenConfig = {
  schema: ['src/gql/*.graphql', 'src/gen/onn/gql/*.graphql'],
  generates: {
    './src/gen/gql/resolvers-types.ts': {
      config: {
        useIndexSignature: true,
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
};
export default server;
