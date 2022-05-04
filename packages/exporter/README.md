# Exporter

This package is part of a [collection of tools](../../../README.md) to work more effectively with data using [GraphCMS](https://graphcms.com/).

## Usage

The `exportData` function supports both CommonJS and ESM modules, and takes two objects as arguments:

1. ### Environment **Required**

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
| ⎿           | includeSystemFields  | boolean  | `true`  | Controls filtering system fields                    |
| ⎿           | includeHiddenFields  | boolean  | `true`  | Controls filtering hidden fields                    |
| ⎿           | includeApiOnlyFields | boolean  | `true`  | Controls filtering fields marked as api-only        |
| exclude     |                      | object   |         |                                                     |
| ⎿           | model                |          |         | Controls excluding content models by name           |
| ⎿           | field                |          |         | Controls excluding fields by name                   |
| ⎿           | type                 |          |         | Controls excluding fields by type                   |
| ⎿           | subType              |          |         | Controls excluding fields by sub-type               |

### See also

### [Importer](../importer/readme.md)

[Upsert](<https://en.wiktionary.org/wiki/upsert#:~:text=upsert%20(plural%20upserts),updates%20them%20if%20they%20do.>) JSON data in bulk, with controls to filter the input

### [Publisher](../publisher/readme.md)

Publish JSON data in bulk, with controls to filter the input
