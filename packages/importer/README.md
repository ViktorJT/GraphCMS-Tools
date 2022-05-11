# Importer

This package is part of a [collection of tools](https://github.com/ViktorJT/GraphCMS-Tools) to work more effectively with data using [GraphCMS](https://graphcms.com/).

## Getting Started

#### Prerequisites
1. Git
2. Node: any 12.x version starting with v12.0.0 or greater
3. NPM

#### Installation
- `npm i @graphcms-tools/importer`

## Usage

The `importerData` function supports both CommonJS and ESM modules, and takes two objects as arguments:

```javascript

  // Both ESM (import) and CJS (require) are possible
  import importerData from '@graphcms-tools/importer';

  async function main() {
    const data = importerData(environment, options);
    return data;
  }

```

### Input

The `importData` function supports both CommonJS and ESM modules, and takes three objects as arguments:

1. ### Data **Required**

See the output of the [exporter package](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/exporter) for reference.

2. ### Environment **Required**

_P.s. environment variables should never be committed._

| property             | type   | where                                    |
| -------------------- | ------ | ---------------------------------------- |
| projectId            | string | GraphCMS Settings > General > Project    |
| permanentAccessToken | string | GraphCMS Settings > General > API Access |
| contentApi           | string | GraphCMS Settings > General > API Access |

3. ### Options

| property    | sub-property | type   | default |                                                 |
| ----------- | ------------ | ------ | ------- | ----------------------------------------------- |
| concurrency |              | number | 1       | Controls how many requests to run in each batch |
| exclude     |              | object |         |                                                 |
| ⎿          | model        | [key: string]: boolean |         | Controls excluding content models by name, set to true to filter, e.g.: `{ modelName: true }` |
| ⎿           | field                | [key: string]: boolean |         | Controls excluding fields by name, set to true to filter, e.g.: `{ fieldName: true }` |

### Example

```javascript
const environment = {
  contentApi: "https://api-eu-central-1-saeco.graphcms.com/v2/<id>/<environment>",
  projectId: "123456789",
  permanentAccessToken: "abc",
}

const options = {
  concurrency: 3;
  exclude: {
    model: {
      "ModelName#2": true;
    };
    field: {
      "ModelName#2": true;
    };
  };
}

const [importedData, rejectedData] = await importData(environment, options);

```

#### See also

#### [Exporter](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/exporter)

Export data as JSON in bulk, with controls to filter the output

#### [Publisher](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/publisher)

Publish JSON data in bulk, with controls to filter the input
