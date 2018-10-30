import { Layout } from 'antd';
import path from "path";
import * as React from "react";
import { findDOMNode } from 'react-dom';
import SwaggerUI from "swagger-ui";
import SwaggerUIStandalonePreset from "swagger-ui/dist/swagger-ui-standalone-preset";
import "swagger-ui/dist/swagger-ui.css";

const { Content } = Layout;

interface IContentProps {
  server: string
  selectedPath: string
}
interface IRequest {
  url: string
}

const intializeState = { url: "" };
type State = Readonly<typeof intializeState>


class PageContent extends React.PureComponent<IContentProps>{
  public static getDerivedStateFromProps(props: IContentProps, state: State) {
    if (props.selectedPath !== state.url) {
      return { url: props.selectedPath }
    }
    return null;
  }
  public state: State = intializeState
  public container: Element | Text | null = null;
  public componentDidMount() {
    this.container = findDOMNode(this);
    this.renderPage(this.state.url)
  }
  public componentDidUpdate(prevProps: IContentProps, prevState: State) {
    if (prevState.url !== this.state.url) {
      this.renderPage(this.state.url);
    }
  }
  public requestInterceptor = (request: IRequest): IRequest => {
    const ABSOLUTE_URL_REGEXP = new RegExp('^([a-z]+://|//)', 'i');
    if (ABSOLUTE_URL_REGEXP.test(request.url)) {
      const startIndex = request.url.search(/\/spec\/.*/);
      const realUrl = request.url.substring(startIndex);
      return { ...request, url: path.join(this.props.server, realUrl) };
    }
    const url = path.join(this.props.server, request.url);
    return { ...request, url };
  }
  public renderPage(url: string) {
    if (url) {
      /* tslint:disable */
      SwaggerUI({
        url,
        domNode: this.container,
        deepLinking: true,
        presets: [
          SwaggerUI.presets.apis,
          SwaggerUIStandalonePreset
        ],
        requestInterceptor: this.requestInterceptor,
        plugins: [
          SwaggerUI.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
      })
      /* tslint:enable */
    }
  }
  public render() {
    return (<Content className="App-content" />)
  }
}

export default PageContent;