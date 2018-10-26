import { Layout, Tree } from 'antd';
import { AntTreeNode, AntTreeNodeSelectedEvent } from "antd/lib/tree/Tree.d";
import * as React from 'react';
import "./Sidebar.css";

const { Sider } = Layout;
const { TreeNode } = Tree;

export interface ISpec {
  name: string,
  path: string,
  parent?: string,
}

interface ISidebarProps {
  specs: ISpec[]
  basePath?: string
  onSelected: (path: string) => void
  selectedPath: string
}


const ROOT = "root";


class Sidebar extends React.PureComponent<ISidebarProps>{
  public static defaultProps = {
    basePath: ""
  }
  public firstLeaf: string | undefined = undefined
  public componentDidMount() {
    if (!this.props.selectedPath && this.firstLeaf) {
      this.selectPath(this.firstLeaf);
    }
  }
  public selectPath(path: string) {
    this.props.onSelected(path);
  }
  public handleSelect = (selectedKeys: string[], e: AntTreeNodeSelectedEvent) => {
    if (e.selectedNodes && e.selectedNodes.length) {
      const selectedNode: AntTreeNode = e.selectedNodes[0];
      this.selectPath(selectedNode.props.path);
    }
  }
  public sortTree(specs: ISpec[]): { [s: string]: ISpec[] } {
    const childMapping: { [s: string]: ISpec[] } = {}
    specs.forEach((spec) => {
      const parent = spec.parent || ROOT;
      const siblings = childMapping[parent] || (childMapping[parent] = []);
      siblings.push(spec);
    })
    return childMapping;
  }
  public renderTreeMenu(childMapping: { [s: string]: ISpec[] }, parentKey: string = ROOT) {
    const children: ISpec[] = childMapping[parentKey];
    if (children) {
      return children.map((item) => {
        if (childMapping.hasOwnProperty(item.path)) {
          return <TreeNode selectable={false} title={item.name} key={item.path}>
            {this.renderTreeMenu(childMapping, item.path)}
          </TreeNode>;
        }
        if (!this.firstLeaf) {
          this.firstLeaf = item.path;
        }
        return <TreeNode key={item.path} title={item.name} path={item.path} />;
      });
    }
    return null;
  }
  public render() {
    const childMapping: { [s: string]: ISpec[] } = this.sortTree(this.props.specs)
    return <Sider className="Sidebar" collapsedWidth={20} collapsible={true} theme="light" width={250} style={{ overflow: "auto" }}>
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