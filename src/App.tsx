import React, { useState } from "react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import CssBaseLine from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import {
  Tree,
  DragLayerMonitorProps,
  getDescendants
} from "@minoru/react-dnd-treeview";
import { NodeModel, CustomData } from "./types";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import { AddDialog } from "./AddDialog";
import { theme } from "./theme";
import styles from "./App.module.css";
import SampleData from "./sample_data.json";

const getLastId = (treeData: NodeModel[]) => {
  const reversedArray = [...treeData].sort((a, b) => {
    if (a.id < b.id) {
      return 1;
    } else if (a.id > b.id) {
      return -1;
    }

    return 0;
  });

  if (reversedArray.length > 0) {
    return reversedArray[0].id;
  }

  return 0;
};

function App() {
  const [treeData, setTreeData] = useState<NodeModel<CustomData>[]>(SampleData);
  const handleDrop = (newTree: NodeModel<CustomData>[]) => setTreeData(newTree);
  const [open, setOpen] = useState<boolean>(false);

  const handleDelete = (id: NodeModel["id"]) => {
    const deleteIds = [
      id,
      ...getDescendants(treeData, id).map((node) => node.id)
    ];
    const newTree = treeData.filter((node) => !deleteIds.includes(node.id));

    setTreeData(newTree);
  };

  const handleCopy = (id: NodeModel["id"]) => {
    const lastId = getLastId(treeData);
    const targetNode = treeData.find((n) => n.id === id);
    const descendants = getDescendants(treeData, id);
    const partialTree = descendants.map((node: NodeModel<CustomData>) => ({
      ...node,
      id: node.id + lastId,
      parent: node.parent + lastId
    }));

    setTreeData([
      ...treeData,
      {
        ...targetNode,
        id: targetNode.id + lastId
      },
      ...partialTree
    ]);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = (newNode: Omit<NodeModel<CustomData>, "id">) => {
    const lastId = getLastId(treeData) + 1;

    setTreeData([
      ...treeData,
      {
        ...newNode,
        id: lastId
      }
    ]);

    setOpen(false);
  };

  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseLine />
        <div className={styles.app}>
          <div>
            <Button onClick={handleOpenDialog} startIcon={<AddIcon />}>
              Add Node
            </Button>
            {open && (
              <AddDialog
                tree={treeData}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
              />
            )}
          </div>
          <Tree
            tree={treeData}
            rootId={0}
            render={(node: NodeModel<CustomData>, options) => (
              <CustomNode
                node={node}
                {...options}
                onDelete={handleDelete}
                onCopy={handleCopy}
              />
            )}
            dragPreviewRender={(
              monitorProps: DragLayerMonitorProps<CustomData>
            ) => <CustomDragPreview monitorProps={monitorProps} />}
            onDrop={handleDrop}
            classes={{
              root: styles.treeRoot,
              draggingSource: styles.draggingSource,
              dropTarget: styles.dropTarget
            }}
          />
        </div>
      </ThemeProvider>
    </StylesProvider>
  );
}

export default App;
