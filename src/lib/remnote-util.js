/**
 * TODO: This should be part of the API.
 */

import RemNoteAPI from 'remnote-api';

const SETTINGS_REM = 'Plugin Settings';

export async function getDocument() {
  const context = await RemNoteAPI.v0.get_context();
  console.log('context', context);
  const documentRem = await RemNoteAPI.v0.get(context.documentId);
  return documentRem;
}

export async function getRem(options = {}) {
  if (options.id) {
    return await RemNoteAPI.v0.get(options.id);
  } else if (options.name) {
    return await RemNoteAPI.v0.get_by_name(options.name);
  }
}

export async function getChildren(rem, visibleOnly = False) {
  const children = visibleOnly ? rem.visibleRemOnDocument : rem.children;
  // TODO: Children have the correct order, visibleRemOnDocument don't
  console.log('Children', children);
  children.reverse();
  return await Promise.all(children.map((remId) => RemNoteAPI.v0.get(remId)));
}

export async function getVisibleChildren(remId) {
  return getChildren(remId, true);
}

/**
 * Take a Rem, and extract its text. The rem.name and rem.content fields are
 * both of type "RichTextInterface", which is an array of text strings, or js
 * objects representing rich text element. Text is extracted recursively from
 * Rem Reference elements.
 */
export async function getRemText(rem, exploredRem = []) {
  if (!rem.found) return '';

  const richTextElementsText = await Promise.all(
    // Go through each element in the rich text
    rem.name.concat(rem.content || []).map(async (richTextElement) => {
      // If the element is a string, juts return it
      if (typeof richTextElement == 'string') {
        return richTextElement;
        // If the element is a Rem Reference (i == "q"), then recursively get that Rem Reference's text.
      } else if (richTextElement.i == 'q' && !exploredRem.includes(richTextElement._id)) {
        return await getRemText(
          await RemNoteAPI.v0.get(richTextElement._id),
          // Track explored Rem to avoid infinite loops
          exploredRem.concat([richTextElement._id])
        );
      } else {
        // If the Rem is some other rich text element, just take its .text property.
        return richTextElement.text;
      }
    })
  );
  return richTextElementsText.join('');
}

export async function loadText(remList) {
  await Promise.all(
    remList.map(async (rem) => {
      rem.text = await getRemText(rem);
      return rem;
    })
  );
}

export async function loadTags(rem) {
  rem.tags = await Promise.all(
    rem.tagParents.map(async (tagId) => {
      let tagRem = await RemNoteAPI.v0.get(tagId);
      return tagRem.nameAsMarkdown;
      // let text = await getRemText(tagRem);
      // console.log(text);
      // return text;
    })
  );
}

/** ----------- Plugin related --------------- */

/**
 * @returns URL parameters as an Object. When supplied with duplicate keys, only
 *          the last value is taken
 */
export function getURLConfig() {
  return Object.fromEntries(new URLSearchParams(location.search));
}
