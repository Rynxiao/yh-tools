import PropTypes from 'prop-types';
import React from 'react';
import loadable from '@loadable/component';
import Loading from './loading';

const Lazyload = ({ path }) => {
  const LoadableComponent = loadable(
    () => import(`../pages/${path}`),
    { fallback: <Loading /> },
  );
  return <LoadableComponent />;
};

Lazyload.propTypes = {
  path: PropTypes.string.isRequired,
};

export default Lazyload;
