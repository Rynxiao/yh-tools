import {
  Col, Row, Input, Icon,
} from 'antd';
import React, { Component } from 'react';
import {
  findParentNode,
  hideCollapseFlag,
  hideCollapseIcon,
  isNextSiblingShow,
  setNextSiblingsDisplay,
  showCollapseFlag,
  showCollapseIcon,
  TYPES,
} from '../utils/json-dom';
import './styles/json-visualizer.less';

const { TextArea } = Input;
const ARRAY = 'ARRAY';
const OBJECT = 'OBJECT';
const classNames = {
  JSON_OBJECT_WRAPPER: 'json-object-wrapper',
  JSON_OBJECT_CONTENT: 'json-object-content',
  JSON_OBJECT_COLLAPSE: 'json-object-collapse',
  JSON_OBJECT_ELLIPSE: 'json-object-ellipse',
  JSON_ARRAY_WRAPPER: 'json-array-wrapper',
  JSON_ARRAY_CONTENT: 'json-array-content',
  JSON_ARRAY_COLLAPSE: 'json-array-collapse',
  JSON_ARRAY_ELLIPSE: 'json-array-ellipse',
};
const ICON_COLLAPSE = 'icon-collapse';
const ICON_EXPAND = 'icon-expand';

const RowNumber = ({ number = 231 }) => {
  const rowNumberItems = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < number; i++) {
    rowNumberItems.push(<div key={`row${i}`} className="row-number-item">{i + 1}</div>);
  }

  return rowNumberItems;
};

class JsonVisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: '',
    };
  }

  expandOrCollapse = (event, type) => {
    const { target } = event;
    const iconParentNode = findParentNode(target, classNames[`JSON_${type}_WRAPPER`]);
    if (isNextSiblingShow(iconParentNode, classNames[`JSON_${type}_CONTENT`])) {
      setNextSiblingsDisplay(iconParentNode, false, classNames[`JSON_${type}_CONTENT`]);
      showCollapseFlag(iconParentNode, classNames[`JSON_${type}_COLLAPSE`], classNames[`JSON_${type}_ELLIPSE`]);
      showCollapseIcon(iconParentNode, ICON_COLLAPSE, ICON_EXPAND);
    } else {
      setNextSiblingsDisplay(iconParentNode, true, classNames[`JSON_${type}_CONTENT`]);
      hideCollapseFlag(iconParentNode, classNames[`JSON_${type}_COLLAPSE`], classNames[`JSON_${type}_ELLIPSE`]);
      hideCollapseIcon(iconParentNode, ICON_COLLAPSE, ICON_EXPAND);
    }
  };

  generateTemplate = (jsonObject, index = 0) => {
    if (TYPES.isObject(jsonObject)) {
      const keys = Object.keys(jsonObject);
      let objectHTML = [
        <span className={classNames.JSON_OBJECT_WRAPPER} key={`object${index}`}>
          <span className={ICON_EXPAND}>
            <Icon onClick={(event) => this.expandOrCollapse(event, OBJECT)} type="minus" />
          </span>
          <span className={ICON_COLLAPSE}>
            <Icon onClick={(event) => this.expandOrCollapse(event, OBJECT)} type="plus" />
          </span>
          <span className={classNames.JSON_OBJECT_COLLAPSE}>Object</span>
          <span>{'{'}</span>
          <span className={classNames.JSON_OBJECT_ELLIPSE}>...</span>
        </span>,
      ];
      keys.forEach((key, objectIndex) => {
        const objectHtml = this.generateTemplate(jsonObject[key], index + 1);
        const objectKey = `array${index}${key}${objectIndex}`;
        const content = objectIndex === keys.length - 1
          ? <>{objectHtml}</> : (
            <>
              {objectHtml}
              {','}
            </>
          );
        objectHTML = objectHTML.concat(
          <div className={`${classNames.JSON_OBJECT_CONTENT} key-value-overflow indent`} key={objectKey}>
            <span className="json-key">{`"${key}": `}</span>
            <span>{content}</span>
          </div>,
        );
      });
      objectHTML = objectHTML.concat(<span key={`object${index + 1}`}>{'}'}</span>);
      return objectHTML;
    }

    if (TYPES.isArray(jsonObject)) {
      let arrayHtmlWrapper = [
        <span className={classNames.JSON_ARRAY_WRAPPER} key={`array${index}`}>
          <span className={ICON_EXPAND}>
            <Icon onClick={(event) => this.expandOrCollapse(event, ARRAY)} type="minus" />
          </span>
          <span className={ICON_COLLAPSE}>
            <Icon onClick={(event) => this.expandOrCollapse(event, ARRAY)} type="plus" />
          </span>
          <span className={classNames.JSON_ARRAY_COLLAPSE}>Array</span>
          <span>[</span>
          <span className={classNames.JSON_ARRAY_ELLIPSE}>...</span>
        </span>,
      ];
      jsonObject.forEach((arrayValue, arrayIndex) => {
        const arrayHtml = this.generateTemplate(arrayValue, index + 1);
        const key = `array${index}${arrayValue}${arrayIndex}`;
        const content = arrayIndex === jsonObject.length - 1
          ? <span>{arrayHtml}</span> : (
            <span>
              {arrayHtml}
              {','}
            </span>
          );
        arrayHtmlWrapper = arrayHtmlWrapper.concat(
          <div className={`${classNames.JSON_ARRAY_CONTENT} indent`} key={key}>
            <span>{content}</span>
          </div>,
        );
      });
      arrayHtmlWrapper = arrayHtmlWrapper.concat(<span key={`array${index + 1}`}>]</span>);
      return arrayHtmlWrapper;
    }

    if (TYPES.isNull(jsonObject)) {
      return <span className="json-value-null" key={`original${index}`}>{`${jsonObject}`}</span>;
    }

    if (TYPES.isString(jsonObject)) {
      return <span className="json-value-string" key={`original${index}`}>{`"${jsonObject}"`}</span>;
    }

    if (TYPES.isBoolean(jsonObject)) {
      return <span className="json-value-bool" key={`original${index}`}>{`${jsonObject}`}</span>;
    }

    if (TYPES.isNumber(jsonObject)) {
      return <span className="json-value-number" key={`original${index}`}>{jsonObject}</span>;
    }
    return null;
  };

  parseData = (data) => {
    try {
      const jsonObject = JSON.parse(data);
      const result = this.generateTemplate(jsonObject);
      this.setState({ result });
    } catch (e) {
      this.setState({ result: e.message });
    }
  };

  onInputPaste = (event) => {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    this.parseData(paste);
  };

  onInputChange = (event) => {
    this.parseData(event.target.value);
  };

  render() {
    const { result } = this.state;
    return (
      <Row className="row">
        <Col className="col" span={10}>
          <TextArea
            className="input-left"
            onPaste={(event) => this.onInputPaste(event)}
            onChange={(event) => this.onInputChange(event)}
          />
        </Col>
        <Col className="col" span={14}>
          <div className="result">
            <div className="util">utils</div>
            <div className="content-wrapper">
              <Row type="flex">
                <Col className="row-number"><RowNumber /></Col>
                <Col className="json-content">{result}</Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default JsonVisualizer;
