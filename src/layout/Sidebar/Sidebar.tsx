import { Layout,Tree } from 'antd';
import {AntTreeNode,AntTreeNodeSelectedEvent} from "antd/lib/tree/Tree.d";
import * as React from 'react';
import "./Sidebar.css";

const { Sider } = Layout;
const { TreeNode } = Tree;

export interface ISpec {
  name:string,
  parent?:string,
}

interface ISidebarProps{
  specs : ISpec[]
  basePath? :string
  onSelected: (path:string) => void
  selectedPath:string
}


const ROOT = "root";


class Sidebar extends React.PureComponent<ISidebarProps>{
  public static defaultProps = {
    basePath:""
  }
  public firstLeaf:string|undefined = undefined
  public componentDidMount(){
    if(!this.props.selectedPath && this.firstLeaf){
      this.selectPath(this.firstLeaf);
    }
  }
  public selectPath(path:string){
    this.props.onSelected(path);
  }
  public handleSelect = (selectedKeys:string[],e:AntTreeNodeSelectedEvent) => {
    if(e.selectedNodes && e.selectedNodes.length){
      const selectedNode:AntTreeNode = e.selectedNodes[0];
      this.selectPath(selectedNode.props.path);
    }
  }
  public sortTree(specs:ISpec[]):{[s:string]:ISpec[]}{
    const childMapping:{[s:string]:ISpec[]} = {}
    specs.forEach((spec) => {
      const parent = spec.parent || ROOT;
      const siblings = childMapping[parent] || (childMapping[parent] = []);
      siblings.push(spec);
    })
    return childMapping;
  }
  public renderTreeMenu(childMapping:{[s:string]:ISpec[]},parentKey:string = ROOT,parentPath?:string) {
    const children:ISpec[] = childMapping[parentKey];
    const newParentPath = parentPath || this.props.basePath
    if(children){
      return children.map((item) => {
        const path = `${newParentPath}/${item.name}`;
        if (childMapping.hasOwnProperty(item.name)) {
          return <TreeNode selectable={false} title={item.name} key={path}>
            {this.renderTreeMenu(childMapping,item.name,path)}
          </TreeNode>;
        }
        if(!this.firstLeaf) {
          this.firstLeaf = path; 
        }
        return <TreeNode key={path} title={item.name} path={path}/>;
      });
    }
    return null;
  }
  public render() {
    const childMapping:{[s:string]:ISpec[]} = this.sortTree(this.props.specs)
    return <Sider className="Sidebar" collapsedWidth={20} collapsible={true} theme="light" width={250} style={{overflow:"auto"}}>
      <Tree
        showLine={true}
        selectedKeys={[this.props.selectedPath]}
        onSelect={this.handleSelect}
        defaultExpandAll={true}
      >
        {this.renderTreeMenu(childMapping)}
      </Tree>
    </Sider>;
  }
}

export default Sidebar