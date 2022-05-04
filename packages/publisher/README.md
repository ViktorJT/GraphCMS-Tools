# Publisher

This package is part of a [collection of tools](../../README.md) to work more effectively with data using [GraphCMS](https://graphcms.com/).

## Usage

The `publishData` function supports both CommonJS and ESM modules, and takes three objects as arguments:

1. ### Data **Required**

See the output of the [importer package]([../packages/importer/readme.md]) for reference.

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
| ⎿           | field        |        |         | Controls excluding fields by name               |

### See also

### [Exporter]([../packages/exporter/readme.md])

Export data as JSON in bulk, with controls to filter the output

### [Importer]([../packages/importer/readme.md])

[Upsert](<https://en.wiktionary.org/wiki/upsert#:~:text=upsert%20(plural%20upserts),updates%20them%20if%20they%20do.>) JSON data in bulk, with controls to filter the input
