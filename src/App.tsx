import { Layout } from 'antd';
import * as React from 'react';
import './App.css';
import PageContent from "./layout/Content/Content"
import Sidebar,{ISpec} from './layout/Sidebar/Sidebar';

const newWindow:any = window;

interface IDocOptions {
  specs:ISpec[],
  basePath:string,
  server:string
}

const getDocOptions = ():IDocOptions => {
  let server = "/";
  const swaggerApiTree:unknown = process.env.SWAGGER_SPECS;
  const specs:ISpec[] = swaggerApiTree as ISpec[] || [];
  const basePath= process.env.SWAGGER_BASE_PATH || "/spec";
  if(process.env.SWAGGER_SERVER){
    server = process.env.SWAGGER_SERVER
  }else if(location.href.search(/\/doc.*/) !== -1){
    server = location.href.replace(/\/doc.*/,"");
  }
  const defaultOptions = {
    basePath,
    server,
    specs,
  }
  if(newWindow.docOptions){
    return {...defaultOptions,...newWindow.docOptions};
  }
  return defaultOptions;
}

class App extends React.Component {
  public state:Readonly<{selectedPath:string}> = {
    selectedPath:""
  }
  public handleSelected = (path:string) => {
    this.setState({
      selectedPath:path
    })
  }

  public render() {
    const {specs,server,basePath} = getDocOptions();
    return (
      <Layout className="App">
        <Sidebar 
          basePath={basePath} 
          selectedPath={this.state.selectedPath} 
          specs={specs} 
          onSelected={this.handleSelected}
        />
        <PageContent selectedPath={this.state.selectedPath} server={server}/>
      </Layout>
    );
  }
}

export default App;
