interface Config {
  concurrency: number;
  targetContentStage: string;
  targetLocales: string[] | [];
  export: {
    schema: boolean;
    queries: boolean;
    results: boolean;
  };
  include: {
    includeSystemModels: boolean,
    includeSystemFields: boolean,
    includeHiddenFields: boolean,
    includeApiOnlyFields: boolean,
  }
  exclude: {
    model: {
      [key: string]: boolean;
    }
    field: {
      [key: string]: boolean;
    }
    type: {
      [key: string]: boolean;
    }
    subType: {
      [key: string]: boolean;
    }
  }
}

const config: Config = {
  concurrency: 1, // TODO
  targetContentStage: 'DRAFT', // TODO Add default to draft instead
  targetLocales: [], // TODO
  export: {
    schema: true,
    queries: true,
    results: true,
  },
  include: {
    includeSystemModels: true,
    includeSystemFields: true, // Id fields are always exported, regardless if true or false
    includeHiddenFields: true,
    includeApiOnlyFields: true,
  },
  exclude: {
    model: {
      //
    },
    field: {
      defaults: true, // ! Required
    },
    type: {
      //
    },
    subType: {
      JSON: true, // TODO
    },
    // TODO option to not query stages to keep results cleaner?
  },
};

export default config;
