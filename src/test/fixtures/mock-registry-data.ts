import { RegistryResponse } from "../../types";

export const mockRegistryData: Record<string, RegistryResponse> = {
  'lodash': {
    name: 'lodash',
    'dist-tags': { latest: '4.17.21' },
    'time': {
      '4.17.21': '2021-05-06T18:23:45.000Z',
      '4.0.0': '2015-01-26T00:00:00.000Z'
    },
    versions: {
      '4.17.21': {
        version: '4.17.21',
        dist: {
          tarball: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz'
        }
      },
      '4.0.0': {
        version: '4.0.0',
        dist: {
          tarball: 'https://registry.npmjs.org/lodash/-/lodash-4.0.0.tgz'
        }
      }
    }
  },
  'express': {
    name: 'express',
    'dist-tags': { latest: '4.19.2' },
    'time': {
      '4.19.2': '2024-03-25T10:00:00.000Z',
      '4.16.0': '2018-03-01T00:00:00.000Z'
    },
    versions: {
      '4.19.2': {
        version: '4.19.2',
        dist: {
          tarball: 'https://registry.npmjs.org/express/-/express-4.19.2.tgz'
        }
      },
      '4.16.0': {
        version: '4.16.0',
        dist: {
          tarball: 'https://registry.npmjs.org/express/-/express-4.16.0.tgz'
        }
      }
    }
  }
};
