/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Root} Root
 */

/**
 * @typedef {Record<string, Sources | null | undefined>} Options
 *   Configuration.
 *
 *   Maps file extensions (without dot, so such as `jpg`) to sources.
 *
 * @typedef {Record<string, string | null | undefined>} Sources
 *   Sources.
 *
 *   Maps file extensions (without dot, so such as `webp`) to mime types.
 */

// import path from "node:path";
import { visit } from "unist-util-visit";

// Note: would be nice to drop `path`, but `replace-ext` uses it too, so we’d
// need to replace a lot.
// Perhaps at some point, maybe in `vfile`, it would be useful to have path
// utilities like `replace-ext` that work on URLs.

/** @type {Options} */
const emptyOptions = {};
/** @type {Sources} */
const emptySources = {};

/**
 * Wrap images in pictures.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function rehype40k(options) {
  const settings = options || emptyOptions;

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    visit(tree, "element", function (node, index, parent) {
      console.log("test");
      console.log(node, index, parent);
      return;
      // if (!parent || typeof index !== "number" || node.tagName !== "img" || !node.properties.src) {
      //   return;
      // }

      // const src = String(node.properties.src);
      // const extension = path.extname(src).slice(1);

      // if (!Object.hasOwn(settings, extension)) {
      //   return;
      // }

      // /** @type {Array<Element>} */
      // const sources = [];
      // const map = settings[extension] || emptySources;
      // /** @type {string} */
      // let key;

      // for (key in map) {
      //   if (Object.hasOwn(map, key)) {
      //     sources.push({
      //       type: "element",
      //       tagName: "source",
      //       properties: { srcSet: replaceExt(src, "." + key), type: map[key] },
      //       children: [],
      //     });
      //   }
      // }

      // parent.children[index] = {
      //   type: "element",
      //   tagName: "picture",
      //   properties: {},
      //   children: [...sources, node],
      // };
    });
  };
}
