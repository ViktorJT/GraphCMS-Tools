# Publisher

This package is part of a [collection of tools](https://github.com/ViktorJT/GraphCMS-Tools) to work more effectively with data using [GraphCMS](https://graphcms.com/).

## Getting Started

#### Prerequisites
1. Git
2. Node: any 12.x version starting with v12.0.0 or greater
3. NPM

#### Installation
- `npm i @graphcms-tools/publisher`

## Usage

The `publishData` function supports both CommonJS and ESM modules, and takes two objects as arguments:

```javascript

  // Both ESM (import) and CJS (require) are possible
  import publishData from '@graphcms-tools/publisher';

  async function main() {
    const data = publishData(environment, options);
    return data;
  }

```

### Input

The `publishData` function supports both CommonJS and ESM modules, and takes three objects as arguments:

1. ### Data **Required**

See the output of the [importer package](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/importer) for reference.

2. ### Environment **Required**

_P.s. environment variables should never be committed._

| property             | type   | where?                                   |
| -------------------- | ------ | ---------------------------------------- |
| permanentAccessToken | string | GraphCMS Settings > General > API Access |
| contentApi           | string | GraphCMS Settings > General > API Access |

3. ### Options

| property    | sub-property | type   | default |                                                 |
| ----------- | ------------ | ------ | ------- | ----------------------------------------------- |
| concurrency |              | number | 1       | Controls how many requests to run in each batch |
| exclude     |              | object |         |                                                 |
| ⎿           | model        |        |         | Controls excluding content models by name       |

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
      "ModelName#1": true;
    };
  };
}

const [importedData, rejectedData] = await importData(environment, options);

```

#### See also

#### [Exporter](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/exporter)

Export data as JSON in bulk, with controls to filter the output

#### [Importer](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/importer)

[Upsert](<https://en.wiktionary.org/wiki/upsert#:~:text=upsert%20(plural%20upserts),updates%20them%20if%20they%20do.>) JSON data in bulk, with controls to filter the input
