# GraphCMS-Tools

Collection of packages to work more effectively with data using [GraphCMS](https://graphcms.com/).

Packages are designed to be able to be chained into powerful workflows, as the output of each 'step' in the process is compatible with the input of the next[^note].

[^note]: For example, you could:

    - Export the content of all models with name 'foo', 'bar', and 'baz',
    - Make changes to the exported JSON, either programmatically or manually
    - Import ([upsert](<https://en.wiktionary.org/wiki/upsert#:~:text=upsert%20(plural%20upserts),updates%20them%20if%20they%20do.>)) the updated content
    - Publish the updated content to selected content stages

### [Exporter](packages/exporter/readme.md)

Export data as JSON in bulk, with controls to filter the output

### [Importer](packages/importer/readme.md)

[Upsert](<https://en.wiktionary.org/wiki/upsert#:~:text=upsert%20(plural%20upserts),updates%20them%20if%20they%20do.>) JSON data in bulk, with controls to filter the input

### [Publisher](packages/publisher/readme.md)

Publish JSON data in bulk, with controls to filter the input
