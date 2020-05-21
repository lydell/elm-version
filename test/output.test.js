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
        "stdout": "Download and run Elm tooling from elm-tooling.json.

      elm-version download
        Downloads the binaries specified in the closest elm-tooling.json.
        Downloads the latest versions if no elm-tooling.json is found.

      elm-version init
        Creates an elm-tooling.json with the latest versions,
        that matches the elm.json created by running 'elm init'.

      elm-version run NAME ...
        Runs the binary NAME with the version specified in elm-tooling.json.
        Runs the latest version if no elm-tooling.json is found.

      elm-version setup DIR
        Creates wrappers for all supported binaries in DIR. DIR should be in $PATH.
        This command is typically run as part of the installation of elm-version.
        The following wrappers are created:
          elm ... -> elm-version run elm ...
          elm-format ... -> elm-version run elm-format ...

      elm-version uninstall
        Prints instructions on how to uninstall elm-version and related files.

      elm-version help
        Prints this message.
      ",
      }
    `);
  });

  test("-h", () => {
    expect(run("-h")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "Download and run Elm tooling from elm-tooling.json.

      elm-version download
        Downloads the binaries specified in the closest elm-tooling.json.
        Downloads the latest versions if no elm-tooling.json is found.

      elm-version init
        Creates an elm-tooling.json with the latest versions,
        that matches the elm.json created by running 'elm init'.

      elm-version run NAME ...
        Runs the binary NAME with the version specified in elm-tooling.json.
        Runs the latest version if no elm-tooling.json is found.

      elm-version setup DIR
        Creates wrappers for all supported binaries in DIR. DIR should be in $PATH.
        This command is typically run as part of the installation of elm-version.
        The following wrappers are created:
          elm ... -> elm-version run elm ...
          elm-format ... -> elm-version run elm-format ...

      elm-version uninstall
        Prints instructions on how to uninstall elm-version and related files.

      elm-version help
        Prints this message.
      ",
      }
    `);
  });

  test("--help", () => {
    expect(run("--help")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "Download and run Elm tooling from elm-tooling.json.

      elm-version download
        Downloads the binaries specified in the closest elm-tooling.json.
        Downloads the latest versions if no elm-tooling.json is found.

      elm-version init
        Creates an elm-tooling.json with the latest versions,
        that matches the elm.json created by running 'elm init'.

      elm-version run NAME ...
        Runs the binary NAME with the version specified in elm-tooling.json.
        Runs the latest version if no elm-tooling.json is found.

      elm-version setup DIR
        Creates wrappers for all supported binaries in DIR. DIR should be in $PATH.
        This command is typically run as part of the installation of elm-version.
        The following wrappers are created:
          elm ... -> elm-version run elm ...
          elm-format ... -> elm-version run elm-format ...

      elm-version uninstall
        Prints instructions on how to uninstall elm-version and related files.

      elm-version help
        Prints this message.
      ",
      }
    `);
  });

  test("help", () => {
    expect(run("help")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "Download and run Elm tooling from elm-tooling.json.

      elm-version download
        Downloads the binaries specified in the closest elm-tooling.json.
        Downloads the latest versions if no elm-tooling.json is found.

      elm-version init
        Creates an elm-tooling.json with the latest versions,
        that matches the elm.json created by running 'elm init'.

      elm-version run NAME ...
        Runs the binary NAME with the version specified in elm-tooling.json.
        Runs the latest version if no elm-tooling.json is found.

      elm-version setup DIR
        Creates wrappers for all supported binaries in DIR. DIR should be in $PATH.
        This command is typically run as part of the installation of elm-version.
        The following wrappers are created:
          elm ... -> elm-version run elm ...
          elm-format ... -> elm-version run elm-format ...

      elm-version uninstall
        Prints instructions on how to uninstall elm-version and related files.

      elm-version help
        Prints this message.
      ",
      }
    `);
  });

  test("ignores extra arguments", () => {
    expect(run("help", "extra", "arg")).toMatchInlineSnapshot(`
      Object {
        "status": 0,
        "stderr": "",
        "stdout": "Download and run Elm tooling from elm-tooling.json.

      elm-version download
        Downloads the binaries specified in the closest elm-tooling.json.
        Downloads the latest versions if no elm-tooling.json is found.

      elm-version init
        Creates an elm-tooling.json with the latest versions,
        that matches the elm.json created by running 'elm init'.

      elm-version run NAME ...
        Runs the binary NAME with the version specified in elm-tooling.json.
        Runs the latest version if no elm-tooling.json is found.

      elm-version setup DIR
        Creates wrappers for all supported binaries in DIR. DIR should be in $PATH.
        This command is typically run as part of the installation of elm-version.
        The following wrappers are created:
          elm ... -> elm-version run elm ...
          elm-format ... -> elm-version run elm-format ...

      elm-version uninstall
        Prints instructions on how to uninstall elm-version and related files.

      elm-version help
        Prints this message.
      ",
      }
    `);
  });
});

describe("init", () => {
  test("elm-tooling.json already exists", () => {
    expect(run("init")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "./elm-tooling.json already exists!
      ",
        "stdout": "",
      }
    `);
  });

  test("extra arguments", () => {
    expect(run("init", "extra")).toMatchInlineSnapshot(`
      Object {
        "status": 1,
        "stderr": "No extra arguments are supported.
      Usage: elm-version init
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
