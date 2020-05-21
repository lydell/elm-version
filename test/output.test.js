// This file tests output of files `elm-version` invocations that do not cause
// side effects.

const { spawnSync } = require("child_process");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..");
const ELM_VERSION = path.join(BASE_DIR, "elm-version");

function replaceBaseDir(string) {
  while (string.includes(BASE_DIR)) {
    string = string.replace(BASE_DIR, "/usr/local/bin");
  }
  return string;
}

function runWithEnv(env, ...args) {
  const { status, stdout, stderr } = spawnSync(ELM_VERSION, args, {
    env: { HOME: "/Users/you", ...env },
    encoding: "utf8",
  });
  return {
    status,
    stdout: replaceBaseDir(stdout),
    stderr: replaceBaseDir(stderr),
  };
}

function run(...args) {
  return runWithEnv({}, ...args);
}

describe("help", () => {
  test("prints help when no arguments given", () => {
    expect(run()).toMatchInlineSnapshot(`
          Object {
            "status": 0,
            "stderr": "",
            "stdout": "elm-version 1.0.0
          Download and run Elm tooling from elm-tooling.json.

          elm-version download
            Downloads the binaries specified in the closest elm-tooling.json.
            Downloads the latest versions if no elm-tooling.json is found.

          elm-version example
            Prints an example elm-tooling.json to help you get started.

          elm-version help
            Prints this message.

          elm-version help more
            Prints help about commands not used very often.

          elm ...
          elm-format ...
            Runs the version of a binary specified in elm-tooling.json.
            Runs the latest version if no elm-tooling.json is found.
            For more information: elm-version help more
          ",
          }
      `);
  });

  test("-h", () => {
    expect(run("-h")).toMatchInlineSnapshot(`
          Object {
            "status": 0,
            "stderr": "",
            "stdout": "elm-version 1.0.0
          Download and run Elm tooling from elm-tooling.json.

          elm-version download
            Downloads the binaries specified in the closest elm-tooling.json.
            Downloads the latest versions if no elm-tooling.json is found.

          elm-version example
            Prints an example elm-tooling.json to help you get started.

          elm-version help
            Prints this message.

          elm-version help more
            Prints help about commands not used very often.

          elm ...
          elm-format ...
            Runs the version of a binary specified in elm-tooling.json.
            Runs the latest version if no elm-tooling.json is found.
            For more information: elm-version help more
          ",
          }
      `);
  });

  test("--help", () => {
    expect(run("--help")).toMatchInlineSnapshot(`
          Object {
            "status": 0,
            "stderr": "",
            "stdout": "elm-version 1.0.0
          Download and run Elm tooling from elm-tooling.json.

          elm-version download
            Downloads the binaries specified in the closest elm-tooling.json.
            Downloads the latest versions if no elm-tooling.json is found.

          elm-version example
            Prints an example elm-tooling.json to help you get started.

          elm-version help
            Prints this message.

          elm-version help more
            Prints help about commands not used very often.

          elm ...
          elm-format ...
            Runs the version of a binary specified in elm-tooling.json.
            Runs the latest version if no elm-tooling.json is found.
            For more information: elm-version help more
          ",
          }
      `);
  });

  test("help", () => {
    expect(run("help")).toMatchInlineSnapshot(`
          Object {
            "status": 0,
            "stderr": "",
            "stdout": "elm-version 1.0.0
          Download and run Elm tooling from elm-tooling.json.

          elm-version download
            Downloads the binaries specified in the closest elm-tooling.json.
            Downloads the latest versions if no elm-tooling.json is found.

          elm-version example
            Prints an example elm-tooling.json to help you get started.

          elm-version help
            Prints this message.

          elm-version help more
            Prints help about commands not used very often.

          elm ...
          elm-format ...
            Runs the version of a binary specified in elm-tooling.json.
            Runs the latest version if no elm-tooling.json is found.
            For more information: elm-version help more
          ",
          }
      `);
  });

  test("ignores extra arguments", () => {
    expect(run("help", "extra", "arg")).toMatchInlineSnapshot(`
          Object {
            "status": 0,
            "stderr": "",
            "stdout": "elm-version 1.0.0
          Download and run Elm tooling from elm-tooling.json.

          elm-version download
            Downloads the binaries specified in the closest elm-tooling.json.
            Downloads the latest versions if no elm-tooling.json is found.

          elm-version example
            Prints an example elm-tooling.json to help you get started.

          elm-version help
            Prints this message.

          elm-version help more
            Prints help about commands not used very often.

          elm ...
          elm-format ...
            Runs the version of a binary specified in elm-tooling.json.
            Runs the latest version if no elm-tooling.json is found.
            For more information: elm-version help more
          ",
          }
      `);
  });

  test("help more", () => {
    expect(run("help", "more")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "elm-version setup DIR
        Creates wrappers for all supported binaries in DIR. DIR should be in $PATH.
        This command is typically run as part of the installation of elm-version.
        The following wrappers are created:
          elm ... -> elm-version run elm ...
          elm-format ... -> elm-version run elm-format ...

      elm-version run NAME ...
        Runs the version of the binary NAME specified in elm-tooling.json.
        Runs the latest version if no elm-tooling.json is found.

      elm-version uninstall
        Prints instructions on how to uninstall elm-version and related files.
      ",
      }
    `);
  });
});

describe("example", () => {
  test("prints example and instructions", () => {
    expect(runWithEnv({ ELM_VERSION_FORCE_TTY: "1" }, "example"))
      .toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "Here is an example elm-tooling.json, with the latest known binaries:

      {
          \\"entrypoints\\": [\\"src/Main.elm\\"],
          \\"binaries\\": {
              \\"elm\\": \\"0.19.1\\",
              \\"elm-format\\": \\"0.8.3\\"
          }
      }

      To create a new project:

        1. mkdir my-project
        2. cd my-project
        3. elm-version example > elm-tooling.json
        4. elm-version download
        5. elm init
        6. mkdir src
        7. touch src/Main.elm
        8. Start working on your project!

      To add elm-tooling.json to an existing project:

        1. cd my-project
        2. elm-version example > elm-tooling.json
        3. Edit elm-tooling.json
           For example, if you previously installed elm and elm-format using npm,
           copy their versions from package.json to elm-tooling.json. Then you can
           remove them from package.json.
           You also need to edit \\"entrypoints\\" in elm-tooling.json to match your project.
        4. elm-version download
        5. Configure tools and editors
           For example, tools should look for just 'elm', not './node_modules/.bin/elm'.
        6. cp \\"$0\\" elm-version
        7. Configure CI and build
           For example, you need to run 'sh elm-version setup && sh elm-version download'
           rather than 'npm install'. More information: https://github.com/lydell/elm-version
      ",
      }
    `);
  });

  test("prints only example if piped", () => {
    expect(run("example")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "{
          \\"entrypoints\\": [\\"src/Main.elm\\"],
          \\"binaries\\": {
              \\"elm\\": \\"0.19.1\\",
              \\"elm-format\\": \\"0.8.3\\"
          }
      }
      ",
      }
    `);
  });

  test("extra arguments", () => {
    expect(run("example", "extra")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "No extra arguments are supported.
      Usage: elm-version example
      ",
        "stdout": "",
      }
    `);
  });
});

describe("setup", () => {
  test("missing directory", () => {
    expect(run("setup")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "You must specify a single installation directory. Got 0 arguments.
      Example: elm-version setup /usr/local/bin
      ",
        "stdout": "",
      }
    `);
  });

  test("extra arguments", () => {
    expect(run("setup", "dir", "extra")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "You must specify a single installation directory. Got 2 arguments.
      Example: elm-version setup /usr/local/bin
      ",
        "stdout": "",
      }
    `);
  });

  test("non-existent directory", () => {
    expect(run("setup", "/does/not/exist/at/all")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "Directory does not exist: /does/not/exist/at/all
      ",
        "stdout": "",
      }
    `);
  });
});

describe("download", () => {
  test("extra arguments", () => {
    expect(run("download", "extra")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "No extra arguments are supported.
      Usage: elm-version download
      ",
        "stdout": "",
      }
    `);
  });
});

describe("run", () => {
  test("missing binary name", () => {
    expect(run("run")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "You must specify the name of the binary to run.
      Example: elm-version run elm
      ",
        "stdout": "",
      }
    `);
  });

  test("missing binary", () => {
    expect(runWithEnv({ ELM_HOME: "/does/not/exist/at/all" }, "run", "elm"))
      .toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "Missing binary: /does/not/exist/at/all/elm-tooling/elm/0.19.1/elm
      To download it: elm-version download
      ",
        "stdout": "",
      }
    `);
  });
});

describe("uninstall", () => {
  test("prints uninstall instructions", () => {
    expect(run("uninstall")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "To uninstall, you need to remove the following:
      (All of them might not exist.)

      /usr/local/bin/elm-version
      /usr/local/bin/elm
      /usr/local/bin/elm-format
      /Users/you/.elm/elm-tooling/
      $ELM_HOME/elm-tooling/ (for past values of ELM_HOME you might have used)
      ",
      }
    `);
  });

  test("prints custom ELM_HOME", () => {
    expect(runWithEnv({ ELM_HOME: "/some/custom/elm/home" }, "uninstall"))
      .toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "To uninstall, you need to remove the following:
      (All of them might not exist.)

      /usr/local/bin/elm-version
      /usr/local/bin/elm
      /usr/local/bin/elm-format
      /Users/you/.elm/elm-tooling/
      /some/custom/elm/home/elm-tooling/
      $ELM_HOME/elm-tooling/ (for past values of ELM_HOME you might have used)
      ",
      }
    `);
  });

  test("extra arguments", () => {
    expect(run("uninstall", "extra")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "No extra arguments are supported.
      Usage: elm-version uninstall
      ",
        "stdout": "",
      }
    `);
  });
});

test("unknown command", () => {
  expect(run("unknown")).toMatchInlineSnapshot(`
    Object {
      "status": 1,
      "stderr": "Unknown command: unknown
    To get help: elm-version help
    ",
      "stdout": "",
    }
  `);
});
