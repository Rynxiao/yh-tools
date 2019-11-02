const TYPES = {};

['String', 'Null', 'Undefined', 'Object', 'Array', 'Boolean', 'Number'].forEach((type) => {
  TYPES[`is${type}`] = (val) => Object.prototype.toString.call(val) === `[object ${type}]`;
});

function findParentNode(dom, parentClass) {
  if (!parentClass) {
    return dom.parentNode;
  }

  let d = dom;
  while (!(typeof d.className === 'string' && d.className.includes(parentClass))) {
    d = d.parentNode;
  }

  return d;
}

function setNextSiblingsDisplay(dom, display, siblingClass) {
  const shouldShow = display ? '' : 'none';
  const siblings = dom.parentNode.querySelectorAll(`.${siblingClass}`);
  siblings.forEach((sibling) => {
    const s = sibling;
    s.style = `display: ${shouldShow};`;
  });
}

function isNextSiblingShow(dom, nextSiblingClass) {
  const { nextSibling } = dom;

  if (nextSibling && nextSibling.className.includes(nextSiblingClass)) {
    return nextSibling.style.display !== 'none';
  }
  return false;
}

function showCollapseFlag(parentNode, collapseText, collapseEllipse) {
  const pNode = parentNode;
  pNode.querySelector(`.${collapseText}`).style.display = 'unset';
  pNode.querySelector(`.${collapseEllipse}`).style.display = 'unset';
}

function showCollapseIcon(parentNode, collapseIcon, expandIcon) {
  const paNode = parentNode;
  paNode.querySelector(`.${collapseIcon}`).style.display = 'unset';
  paNode.querySelector(`.${expandIcon}`).style.display = 'none';
}

function hideCollapseFlag(parentNode, collapseText, collapseEllipse, collapseIcon, expandIcon) {
  const pNode = parentNode;
  pNode.querySelector(`.${collapseText}`).style.display = 'none';
  pNode.querySelector(`.${collapseEllipse}`).style.display = 'none';
}

function hideCollapseIcon(parentNode, collapseIcon, expandIcon) {
  const paNode = parentNode;
  paNode.querySelector(`.${collapseIcon}`).style.display = 'none';
  paNode.querySelector(`.${expandIcon}`).style.display = 'unset';
}

export {
  TYPES,
  findParentNode,
  setNextSiblingsDisplay,
  isNextSiblingShow,
  showCollapseFlag,
  hideCollapseFlag,
  showCollapseIcon,
  hideCollapseIcon,
};
