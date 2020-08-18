async function getDocument() {
  context = await RemNoteAPI.v0.get_context();
  const documentRem = await RemNoteAPI.v0.get(context.documentId);
  return documentRem;
}

async function getVisibleChildren(rem) {
  const visibleRem = await Promise.all(
    rem.visibleRemOnDocument.map((remId) => RemNoteAPI.v0.get(remId))
  );
  return visibleRem;
}

async function getChildren(rem) {
  const children = await Promise.all(rem.children.map((remId) => RemNoteAPI.v0.get(remId)));
  return children;
}

/**
 * Take a Rem, and extract its text. The rem.name and rem.content fields are
 * both of type "RichTextInterface", which is an array of text strings, or js
 * objects representing rich text element. Text is extracted recursively from
 * Rem Reference elements.
 */
async function getRemText(rem, exploredRem = []) {
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
