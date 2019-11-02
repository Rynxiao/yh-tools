import {
  Col, Row, Input, Icon, message,
} from 'antd';
import React, { Component } from 'react';
import uuidv1 from 'uuid/v1';
import CollapseAndExpand from '../components/json-visualizer/collapse-and-expand';
import {
  classNames, ICON_COLLAPSE, ICON_EXPAND, OBJECT, ARRAY,
} from '../components/json-visualizer/constants';
import RowNumber from '../components/json-visualizer/row-number';
import TextHtml from '../components/json-visualizer/text-html';
import Lazyload from '../components/lazyload';
import { downloadRawText, removeSelection } from '../utils';
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
      htmlString: '',
      htmlTemplate: false,
      clipboard: null,
    };
    this.htmlInput = React.createRef();
    this.pasteIcon = React.createRef();
  }

  componentDidMount() {
    // eslint-disable-next-line no-undef
    const clipboard = new ClipboardJS(this.pasteIcon.current);
    clipboard.on('success', () => {
      message.success('内容已经成功复制到剪切板');
    });

    clipboard.on('error', () => {
      message.error('复制错误');
    });
    this.setState({ clipboard });
  }

  componentWillUnmount() {
    const { clipboard } = this.state;
    clipboard.destroy();
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

  generateSpace = (number) => Array(number).fill('\xa0\xa0').join('');

  generateObjectHtml = (jsonObject, keyIndex) => {
    const keys = Object.keys(jsonObject);
    let objectSTRING = '{\n';
    let objectHTML = [
      <CollapseAndExpand
        key={`objectCAE${keyIndex}`}
        type={OBJECT}
        keyIndex={keyIndex}
        expandOrCollapse={this.expandOrCollapse}
      />,
    ];
    keys.forEach((key, objectIndex) => {
      const { html, string } = this.generateTemplate(jsonObject[key], keyIndex + 1);
      const objectKey = `array${keyIndex}${key}${objectIndex}`;
      const isLastValue = objectIndex === keys.length - 1;
      const content = objectIndex === isLastValue
        ? <>{html}</> : (
          <>
            {html}
            {','}
          </>
        );
      objectHTML = objectHTML.concat(
        <div className={`${classNames.JSON_OBJECT_CONTENT} key-value-overflow indent`} key={objectKey}>
          <span className="json-key">{`"${key}": `}</span>
          <span>{content}</span>
        </div>,
      );
      objectSTRING += `${this.generateSpace(keyIndex + 1)}"${key}": ${isLastValue ? string : `${string},`}\n`;
    });
    objectHTML = objectHTML.concat(<span key={`object${keyIndex + 1}`}>{'}'}</span>);
    objectSTRING += `${this.generateSpace(keyIndex)}}`;
    return { html: objectHTML, string: objectSTRING };
  };

  generateArrayHtml = (jsonObject, keyIndex) => {
    let arraySTRING = '[';
    let arrayHTML = [
      <CollapseAndExpand
        key={`arrayCAE${keyIndex}`}
        type={ARRAY}
        keyIndex={keyIndex}
        expandOrCollapse={this.expandOrCollapse}
      />,
    ];
    jsonObject.forEach((arrayValue, arrayIndex) => {
      const { html, string } = this.generateTemplate(arrayValue, keyIndex + 1);
      const key = `array${keyIndex}${arrayValue}${arrayIndex}`;
      const isLastValue = arrayIndex === jsonObject.length - 1;
      const content = arrayIndex === jsonObject.length - 1
        ? <span>{html}</span> : (
          <span>
            {html}
            {','}
          </span>
        );
      arrayHTML = arrayHTML.concat(
        <div className={`${classNames.JSON_ARRAY_CONTENT} indent`} key={key}>
          <span>{content}</span>
        </div>,
      );
      arraySTRING += `\n${this.generateSpace(keyIndex + 1)}${isLastValue ? string : `${string},`}`;
    });
    arrayHTML = arrayHTML.concat(<span key={`array${keyIndex + 1}`}>]</span>);
    arraySTRING += `\n${this.generateSpace(keyIndex)}]`;
    return { html: arrayHTML, string: arraySTRING };
  };

  plainText = (className, index, value) => ({
    html: <TextHtml name={className} keyIndex={`original${index}`} jsonObject={value} />,
    string: value,
  });

  generateTemplate = (jsonObject, index = 0) => {
    if (TYPES.isObject(jsonObject)) {
      return this.generateObjectHtml(jsonObject, index);
    }

    if (TYPES.isArray(jsonObject)) {
      return this.generateArrayHtml(jsonObject, index);
    }

    if (TYPES.isNull(jsonObject)) {
      return this.plainText('json-value-null', index, `${jsonObject}`);
    }

    if (TYPES.isString(jsonObject)) {
      return this.plainText('json-value-string', index, `"${jsonObject}"`);
    }

    if (TYPES.isBoolean(jsonObject)) {
      return this.plainText('json-value-bool', index, `${jsonObject}`);
    }

    if (TYPES.isNumber(jsonObject)) {
      return this.plainText('json-value-number', index, jsonObject);
    }
    return { html: null, string: '' };
  };

  parseData = (data) => {
    try {
      const jsonObject = JSON.parse(data);
      const result = this.generateTemplate(jsonObject).html;
      const htmlString = this.generateTemplate(jsonObject).string;
      this.setState({ result, htmlString });
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

  showHtmlTemplate = () => {
    const { htmlString } = this.state;
    if (htmlString) {
      this.setState({ htmlTemplate: true }, () => {
        this.htmlInput.current.textAreaRef.select();
      });
    }
  };

  hideHtmlTemplate = () => {
    this.setState(
      { htmlTemplate: false },
      () => removeSelection(),
    );
  };

  downloadJson = () => {
    const { htmlString } = this.state;
    if (htmlString) {
      downloadRawText(`${uuidv1()}.json`, htmlString);
    }
  };

  render() {
    const { result, htmlTemplate, htmlString } = this.state;
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
            <div className="util">
              <Row type="flex" justify="space-between" align="middle">
                <Col>
                  <span ref={this.pasteIcon} data-clipboard-target="#htmlInput">
                    <Icon title="复制到剪切板" className="html-icon" type="copy" />
                  </span>
                  <Icon title="下载" className="html-icon" type="download" onClick={this.downloadJson} />
                  { htmlTemplate ? (
                    <Icon title="取消" className="html-icon close-icon" type="close" onClick={this.hideHtmlTemplate} />
                  ) : null }
                </Col>
                <Col>Tips: 双击下方结构可以复制json字符串</Col>
              </Row>
            </div>
            <div className="content-wrapper">
              <Row type="flex">
                <Col className="row-number"><RowNumber /></Col>
                <Col className={`html-content ${htmlTemplate ? 'show' : 'hide'}`}>
                  <TextArea id="htmlInput" ref={this.htmlInput} className="html-input" value={htmlString} />
                </Col>
                <Col className={`json-content ${htmlTemplate ? 'hide' : 'show'}`} onDoubleClick={this.showHtmlTemplate}>{result}</Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default JsonVisualizer;
