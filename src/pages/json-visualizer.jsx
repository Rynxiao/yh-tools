import {
  Col, Row, Input,
} from 'antd';
import React, { Component } from 'react';
import CollapseAndExpand from '../components/json-visualizer/collapse-and-expand';
import {
  classNames, ICON_COLLAPSE, ICON_EXPAND, OBJECT, ARRAY,
} from '../components/json-visualizer/constants';
import RowNumber from '../components/json-visualizer/row-number';
import TextHtml from '../components/json-visualizer/text-html';
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

  generateObjectHtml = (jsonObject, keyIndex) => {
    const keys = Object.keys(jsonObject);
    let objectHTML = [
      <CollapseAndExpand
        type={OBJECT}
        keyIndex={keyIndex}
        expandOrCollapse={this.expandOrCollapse}
      />,
    ];
    keys.forEach((key, objectIndex) => {
      const objectHtml = this.generateTemplate(jsonObject[key], keyIndex + 1);
      const objectKey = `array${keyIndex}${key}${objectIndex}`;
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
    objectHTML = objectHTML.concat(<span key={`object${keyIndex + 1}`}>{'}'}</span>);
    return objectHTML;
  };

  generateArrayHtml = (jsonObject, keyIndex) => {
    let arrayHtmlWrapper = [
      <CollapseAndExpand
        type={ARRAY}
        keyIndex={keyIndex}
        expandOrCollapse={this.expandOrCollapse}
      />,
    ];
    jsonObject.forEach((arrayValue, arrayIndex) => {
      const arrayHtml = this.generateTemplate(arrayValue, keyIndex + 1);
      const key = `array${keyIndex}${arrayValue}${arrayIndex}`;
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
    arrayHtmlWrapper = arrayHtmlWrapper.concat(<span key={`array${keyIndex + 1}`}>]</span>);
    return arrayHtmlWrapper;
  };

  generateTemplate = (jsonObject, index = 0) => {
    if (TYPES.isObject(jsonObject)) {
      return this.generateObjectHtml(jsonObject, index);
    }

    if (TYPES.isArray(jsonObject)) {
      return this.generateArrayHtml(jsonObject, index);
    }

    if (TYPES.isNull(jsonObject)) {
      return <TextHtml name="json-value-null" keyIndex={`original${index}`} jsonObject={`${jsonObject}`} />;
    }

    if (TYPES.isString(jsonObject)) {
      return <TextHtml name="json-value-string" keyIndex={`original${index}`} jsonObject={`"${jsonObject}"`} />;
    }

    if (TYPES.isBoolean(jsonObject)) {
      return <TextHtml name="json-value-bool" keyIndex={`original${index}`} jsonObject={`${jsonObject}`} />;
    }

    if (TYPES.isNumber(jsonObject)) {
      return <TextHtml name="json-value-number" keyIndex={`original${index}`} jsonObject={jsonObject} />;
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
            placeholder="输入或者粘贴json数据..."
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
