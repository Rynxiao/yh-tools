function fakeClick(saveLink) {
  const ev = document.createEvent('MouseEvents');
  ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  saveLink.dispatchEvent(ev);
}

function downloadRawText(name, data) {
  const urlObject = window.URL || window.webkitURL || window;
  const exportBlob = new Blob([data]);
  const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
  saveLink.href = urlObject.createObjectURL(exportBlob);
  saveLink.download = name;
  fakeClick(saveLink);
}

function removeSelection() {
  if (window.getSelection) {
    // all browsers, except IE before version 9
    const selection = window.getSelection();
    selection.deleteFromDocument();

    /* The deleteFromDocument does not work in Opera.
        Work around this bug. */
    if (!selection.isCollapsed) {
      const selRange = selection.getRangeAt(0);
      selRange.deleteContents();
    }

    // The deleteFromDocument works in IE,
    // but a part of the new content becomes selected
    // prevent the selection
    if (selection.anchorNode) {
      selection.collapse(selection.anchorNode, selection.anchorOffset);
    }
  } else if (document.selection) { // Internet Explorer
    document.selection.clear();
  }
}

export {
  downloadRawText,
  removeSelection,
};
