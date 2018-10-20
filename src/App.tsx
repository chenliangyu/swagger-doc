import { Layout } from 'antd';
import * as React from 'react';
import './App.css';
import PageContent from "./layout/Content/Content"
import Sidebar,{ISpec} from './layout/Sidebar/Sidebar';

const swaggerApiTree:unknown = process.env.SWAGGER_API_TREE;
const specs:ISpec[] = swaggerApiTree as ISpec[];

class App extends React.Component {
  public state:Readonly<{selectedPath:string}> = {
    selectedPath:""
  }
  public handleSelected = (path:string) => {
    this.setState({
      selectedPath:path
    })
  }
  public getServer(){
    if(location.href.search(/\/doc.*/) !== -1){
      return location.href.replace(/\/doc.*/,"");
    }
    return "/"
  }
  public getSpec(){
    // tslint:disable-next-line
    console.log(specs);
    return  specs||[];
  }
  public render() {
    return (
      <Layout className="App">
        <Sidebar basePath="/spec/api" selectedPath={this.state.selectedPath} specs={this.getSpec()} onSelected={this.handleSelected}/>
        <PageContent selectedPath={this.state.selectedPath} server={this.getServer()}/>
      </Layout>
    );
  }
}

export default App;
