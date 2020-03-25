import { createHash } from "crypto";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

import { rollup } from "rollup";
import terser from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import JSDOM from "jsdom";

const INDEX_FILE = new URL("./src/index.html", import.meta.url);
const OUTPUT_FOLDER = new URL("./dist/", import.meta.url);
const OUTPUT_FILE = new URL("index.html", OUTPUT_FOLDER);

const minifyCSSFile = path =>
  Promise.all([fs.readFile(path), import("crass")]).then(([css, crass]) =>
    crass.default.parse(css).optimize()
  );

async function build() {
  const dom = new JSDOM.JSDOM(await fs.readFile(INDEX_FILE));
  const { document } = dom.window;
  const { head } = document;

  const stylesheets = head.querySelectorAll('link[rel="stylesheet"]');
  const style = document.createElement("style");
  for (const stylesheetLink of stylesheets) {
    style.append(await minifyCSSFile(new URL(stylesheetLink.href, INDEX_FILE)));
    stylesheetLink.remove();
  }
  head.append(style);

  const modules = head.querySelectorAll('script[type="module"]');
  for (const module of modules) {
    const bundle = await rollup({
      input: fileURLToPath(new URL(module.src, INDEX_FILE)),
      plugins: [resolve(), terser.terser()],
    });
    const outputOptions = { format: "module", sourcemap: true };
    const { output } = await bundle.generate(outputOptions);
    const hash = createHash("sha1");
    hash.update(output[0].code);
    module.src = `bundle.${hash.digest("base64")}.js`;
    outputOptions.file = fileURLToPath(new URL(module.src, OUTPUT_FOLDER));
    await bundle.write(outputOptions);
  }

  fs.writeFile(OUTPUT_FILE, dom.serialize());

  return "Done!";
}
const PUBLIC_FOLDER = new URL("public/", import.meta.url);

const copyFiles = () =>
  fs
    .readdir(PUBLIC_FOLDER)
    .then(files =>
      Promise.all(
        files.map(fileName =>
          fs.copyFile(
            new URL(fileName, PUBLIC_FOLDER),
            new URL(fileName, OUTPUT_FOLDER)
          )
        )
      )
    );

Promise.all([copyFiles(), build()]).then(console.log, console.error);
