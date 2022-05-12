# Exporter

This package is part of a [collection of tools](https://github.com/ViktorJT/GraphCMS-Tools) to work more effectively with data in bulk using [GraphCMS](https://graphcms.com/).

## Getting Started

#### Prerequisites
1. Git
2. Node: any 12.x version starting with v12.0.0 or greater
3. NPM

#### Installation
- `npm i @graphcms-tools/exporter`

## Usage

The `exportData` function supports both CommonJS and ESM modules, and takes two objects as arguments:

```javascript

  // Both ESM (import) and CJS (require) are possible
  import exportData from '@graphcms-tools/exporter';

  async function main() {
    const data = exportData(environment, options);
    return data;
  }

```

1. ### Environment (Required)

**Make sure to generate a permanent access token with sufficient permissions, including the management api**

_P.s. environment variables should never be committed._

| property             | type   | where?                                   |
| -------------------- | ------ | ---------------------------------------- |
| projectId            | string | GraphCMS Settings > General > Project    |
| permanentAccessToken | string | GraphCMS Settings > General > API Access |
| contentApi           | string | GraphCMS Settings > General > API Access |

2. ### Options

| property    | sub-property         | type     | default |                                                     |
| ----------- | -------------------- | -------- | ------- | --------------------------------------------------- |
| concurrency |                      | number   | 1       | Controls how many requests to run in each batch     |
| target      |                      | object   |         |                                                     |
| ⎿           | contentStage         | string   | 'DRAFT' | Controls which content stage to import content from |
| ⎿           | locales              | string[] |         | Controls which locales to export from               |
| include     |                      | object   |         |                                                     |
| ⎿           | includeSystemModels  | boolean  | `true`  | Controls filtering system models                    |
| ⎿           | includeSystemFields  | boolean  | `true`  | Controls filtering system fields, **ID fields are always exported** |
| ⎿           | includeHiddenFields  | boolean  | `true`  | Controls filtering hidden fields                    |
| ⎿           | includeApiOnlyFields | boolean  | `true`  | Controls filtering fields marked as api-only        |
| exclude     |                      | object   |         |                                                     |
| ⎿           | model                | [key: string]: boolean |         | Controls excluding content models by name, set to true to filter, e.g.: `{ modelName: true }` |
| ⎿           | field                | [key: string]: boolean |         | Controls excluding fields by name, set to true to filter, e.g.: `{ fieldName: true }` |
| ⎿           | type                 | [key: string]: boolean |         | Controls excluding fields by type, set to true to filter, e.g.: `{ typeName: true }`|
| ⎿           | subType              | [key: string]: boolean |         | Controls excluding fields by sub-type, set to true to filter, e.g.: `{ subType: true }` |

### Example

```javascript
const environment = {
  contentApi: "https://api-eu-central-1-saeco.graphcms.com/v2/<id>/<environment>",
  projectId: "123456789",
  permanentAccessToken: "abc",
}

const options = {
  concurrency: 3;
  target: {
    contentStage: 'DRAFT';
    locales: ['en-US', 'de-DE'];
  };
  include: {
    includeSystemModels: true;
    includeSystemFields: true;
    includeHiddenFields: true;
    includeApiOnlyFields: true;
  };
  search: {
    models: ['ModelName#1', 'ModelName#2'];
    fields: ['FieldName#1', 'FieldName#2'];
  };
  exclude: {
    model: {
      "ModelName#2": true;
    };
    field: {
      "ModelName#2": true;
    };
    type: {
      "SimpleField": true;
    };
    subType: {
      JSON: true;
    };
  };
}

const data = await exportData(environment, options);

```

#### See also

#### [Importer](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/importer)

[Upsert](<https://en.wiktionary.org/wiki/upsert#:~:text=upsert%20(plural%20upserts),updates%20them%20if%20they%20do.>) JSON data in bulk, with controls to filter the input

#### [Publisher](https://github.com/ViktorJT/GraphCMS-Tools/tree/main/packages/publisher)

Publish JSON data in bulk, with controls to filter the input
