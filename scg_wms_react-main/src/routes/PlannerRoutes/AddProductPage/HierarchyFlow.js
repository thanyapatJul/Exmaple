import React, { useState, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from 'react-flow-renderer';
import Axios from 'axios';

const client = Axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`
});
client.defaults.xsrfCookieName = 'csrftoken';
client.defaults.xsrfHeaderName = 'X-CSRFToken';
client.defaults.withCredentials = true;
client.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const transformDataToNodesAndEdges = (node, level = 0, parentId = null, nodes = [], edges = [], yOffset = 0) => {
    nodes.push({
        id: node.ZCA,
        type: 'default',
        sourcePosition: 'right',
        targetPosition: 'left',
        data: { label: node.ZCA },
        position: { x: level * 250, y: yOffset * 100 },
    });

    if (parentId) {
        edges.push({
            id: `e${parentId}-${node.ZCA}`,
            source: parentId,
            target: node.ZCA,
            type: 'smoothstep',
            animated: true,
        });
    }

    if (node.children) {
        node.children.forEach((child, index) => {
            transformDataToNodesAndEdges(child, level + 1, node.ZCA, nodes, edges, yOffset + index);
        });
    }

    return { nodes, edges };
};

const HierarchyFlow = ({ rootId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (rootId) {
            client.get('wms/api/material-hierarchy', { params: { root_id: rootId } })
                .then(response => {
                    if (response.data.success) {
                        const hierarchyData = response.data.hierarchy;
                        

                        const { nodes, edges } = transformDataToNodesAndEdges(hierarchyData);
                        
                        

                        setNodes(nodes);
                        setEdges(edges);
                    } else {
                        console.error('Error fetching hiserarchy:', response.data.error);
                    }
                })
                .catch(error => {
                    console.error('Error fetching hierarchy:', error);
                });
        }
    }, [rootId]);

    return (
        <div style={{ height: '600px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
};

export default HierarchyFlow;
