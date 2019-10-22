import uuidv1 from 'uuid/v1';

const clientId = uuidv1();

function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

export {
  clientId,
  trim,
};
