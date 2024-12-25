import React, { useEffect, useState } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { useToast, IconButton, Box } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";

const CustomNode = ({ data }) => {
  const [showName, setShowName] = useState(false);
  const toast = useToast();
  const [dateIndex, setDateIndex] = useState(0); // Track the current date index

  // Handle navigation between dates
  const handlePrevDate = () => {
    if (dateIndex > 0) {
      setDateIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNextDate = () => {
    if (dateIndex < data.dates.length - 1) {
      setDateIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleNodeClick = () => {
    // navigator.clipboard
    //   .writeText(data.label)
    //   .then(() => {
    //     toast({
    //       title: "Copied to clipboard.",
    //       description: `ZCA: ${data.label} has been copied.`,
    //       status: "success",
    //       duration: 2000,
    //       isClosable: true,
    //       position: "top-right",
    //     });
    //   })
    //   .catch((err) => console.error("Failed to copy text: ", err));
  };

  // Dynamic background color based on selection

  const bgColor = data.isSelected
    ? "#FFD700"
    : data.isParent
    ? "#ADD8E6"
    : data.isChild
    ? "#90EE90"
    : "white";

  // Get the current Act, Frozen, and Stock for the selected date

  console.log("Node data:", data);

  return (
    <div
      onMouseEnter={() => setShowName(true)}
      onMouseLeave={() => setShowName(false)}
      onClick={handleNodeClick}
      style={{
        padding: "10px",
        border: "1px solid black",
        borderRadius: "5px",
        backgroundColor: bgColor, // Use the dynamic background color
        cursor: "pointer",
        width: "250px",
      }}
    >
      <div>{data.label}</div>
      <div style={{ marginTop: "5px", fontSize: "12px", color: "gray" }}>
        {data.field_name}
      </div>
      {showName && (
        <div style={{ marginTop: "5px", color: "gray" }}>{data.name}</div>
      )}
      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {data.matchMachine && data.matchMachine.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "5px",
              border: "1px solid gray",
              borderRadius: "3px",
              backgroundColor: "#f0f0f0",
              fontSize: "12px",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

const initialNodes = [];
const initialEdges = [];

// Function to transform Chain_mat data into nodes and edges for React Flow
const transformDataToNodesAndEdges = (chainMat, selectedStockCode,zcaMachine) => {
  const nodes = [];
  const edges = [];
  const levelYPosition = {}; // Track the y-position for each level
  let selectedParent = null;
  let selectedChildren = [];

  // Helper function to calculate the number of nodes in the subtree
  const calculateSubtreeSize = (node) => {
    if (!node.children || node.children.length === 0) {
      return 1; // Leaf node contributes 1 to the size
    }
    return node.children.reduce(
      (acc, child) => acc + calculateSubtreeSize(child),
      1
    );
  };

  // Recursive function to traverse the tree
  const traverse = (node, x, level, parent = null) => {
    const subtreeSize = calculateSubtreeSize(node);

    if (!levelYPosition[level]) {
      levelYPosition[level] = 0;
    }

    const yOffset = subtreeSize * level * 40;
    const yPos = levelYPosition[level] + yOffset;

    // Check if this node or its parent/child should be selected
    const isSelected = node.code === selectedStockCode.value;
    const matchMachine = Object.keys(zcaMachine).filter(key => key === node.code);
    const matchedValues = matchMachine.length > 0 ? zcaMachine[matchMachine[0]] : null;

    if (isSelected) {
      selectedParent = parent; // Track the parent of the selected node
      selectedChildren = node.children || []; // Track the children
    }

    const parentNode = {
      id: node.code,
      type: "customNode",
      data: {
        label: node.code,
        name: node.name,
        field_name: node.field_name,
        dates: node.dates, // Pass dates to the node
        actual: node.actual, // Pass Act data to the node
        frozen: node.frozen, // Pass Frozen data to the node
        stock: node.stock, // Pass Stock data to the node
        isSelected: isSelected,
        matchMachine:matchedValues,
        isParent: parent && parent.code === selectedStockCode, // Mark as parent
        isChild: selectedChildren.some((child) => child.code === node.code), // Mark as child
      },
      draggable: true,
      position: { x, y: yPos },
    };

    nodes.push(parentNode);

    levelYPosition[level] += yOffset;

    node.children.forEach((child) => {
      edges.push({
        id: `e${node.code}-${child.code}`,
        source: node.code,
        target: child.code,
        animated: true,
      });

      traverse(child, x + 300, level +2.2, node); // Pass the current node as the parent
    });
  };

  if (chainMat) {
    traverse(chainMat, 0, 0);
  }

  return { nodes, edges, selectedParent, selectedChildren };
};

const HorizontalFlow = ({ chain, selectedStockCode , zcaMachine }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = (params) => setEdges((els) => addEdge(params, els));
  console.log(selectedStockCode,'selectedStockCode')
  useEffect(() => {
    if (chain) {
      console.log('chain',chain)
      const { nodes, edges } = transformDataToNodesAndEdges(chain, selectedStockCode,zcaMachine);
      setNodes(nodes);
      setEdges(edges);
    }
  }, [chain, selectedStockCode]);

  const handleNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange} // Track node position changes
      onConnect={onConnect}
      fitView
      zoomOnDoubleClick={false}
      nodesDraggable={true}
      nodesConnectable={true}
      elementsSelectable={true}
      nodeTypes={nodeTypes}
    />
    // Puts arrow here to move 
  );
};

export default HorizontalFlow;
