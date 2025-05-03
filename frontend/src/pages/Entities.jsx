import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    useViewport,
    ReactFlowProvider,
} from '@xyflow/react';
import { Box, Fab } from '@mui/material';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import EntityCard from '../components/EntityCard';
import EntityDialog from '../components/EntityDialog';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import { useSearch } from '../contexts/SearchContext';
import Loading from '../components/Loading';
import { useRtl } from '../contexts/RtlContext';

function Entities() {
    const nodeTypes = useMemo(() => ({ entityCard: EntityCard }), []);
    const theme = useTheme();
    const { auth } = useAuth();
    const { search, setSearch } = useSearch();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const viewport = useViewport();
    const nodesRef = useRef(nodes);
    const reactFlowInstanceRef = useRef(null);
    const { rtl } = useRtl();

    // Ensure nodesRef is always up to date
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Store viewport in localStorage
    useEffect(() => {
        localStorage.setItem('reactFlowCenter', JSON.stringify(viewport));
    }, [viewport]);

    // Parse stored viewport center safely
    const storedCenter = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('reactFlowCenter')) || { x: 0, y: 0 };
        } catch {
            return { x: 0, y: 0 };
        }
    }, []);

    // Search function for nodes
    const performSearch = useCallback((searchQuery) => {
        const searchTerm = searchQuery.trim().toLowerCase();
        if (!searchTerm) return;

        const foundNode = nodesRef.current.find((node) =>
            node.data.label.toLowerCase().includes(searchTerm)
        );

        if (foundNode && reactFlowInstanceRef.current) {
            const newCenter = {
                x: foundNode.position.x + 50,
                y: foundNode.position.y + 100,
            };
            reactFlowInstanceRef.current.setCenter(newCenter.x, newCenter.y, { duration: 500 });
            localStorage.setItem('reactFlowCenter', JSON.stringify(newCenter));
            setSelectedNode(foundNode.data);
        }
    }, []);

    // Optimize text width calculation
    const approximateTextWidth = useCallback(
        (text, avgCharWidth = 8, padding = 20) => text.length * avgCharWidth + padding,
        []
    );

    const getCardWidth = useCallback((entity, avgCharWidth = 8, padding = 20) => {
        return entity.fields.reduce(
            (maxWidth, field) => Math.max(maxWidth, approximateTextWidth(field.label, avgCharWidth)),
            approximateTextWidth(entity.label, avgCharWidth)
        ) + padding;
    }, [approximateTextWidth]);

    // Fetch nodes from the API
    // Replace your fetchNodes function with the following:
    const fetchNodes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
            let currentX = 0;
            // Use Object.entries to capture both key and value.
            const newNodes = Object.entries(data).map(([entityKey, entity], index) => {
                // Use the key as the label.
                const entityData = { label: entityKey, fields: entity.fields };
                const cardWidth = getCardWidth(entityData);
                const nodeObject = {
                    id: entityKey, // Using entityKey as unique id
                    type: 'entityCard',
                    position: { x: currentX, y: 100 },
                    data: {
                        ...entityData,
                        onCopy: () => {
                            setDialogMode('copy');
                            setDialogOpen(true);
                        },
                        onEdit: () => {
                            setDialogMode('edit');
                            setDialogOpen(true);
                        },
                        onDelete: () => {
                            setDialogMode('delete');
                            setDialogOpen(true);
                        },
                        onMouseEnter: () => {
                            setSelectedNode(entityData);
                        },
                        onMouseLeave: () => {
                            setSelectedNode(null);
                            setDialogMode(null);
                        },
                        onEntityClick: (nodeLabel) => {
                            performSearch(nodeLabel);
                        },
                        onReport: () => {
                            setDialogMode('report');
                            setDialogOpen(true);
                        },
                    },
                    style: { width: cardWidth },
                };
                currentX += cardWidth + 30;
                return nodeObject;
            });
            setNodes(newNodes);
        } catch (error) {
            console.error('Error fetching entities:', error);
            setNodes([]);
        } finally {
            setLoading(false);
        }
    }, [getCardWidth, performSearch]);


    // Initial fetch effect
    useEffect(() => {
        fetchNodes();
    }, [fetchNodes]);

    // Listen for search context changes
    useEffect(() => {
        if (nodes.length > 0 && search) {
            const timer = setTimeout(() => {
                performSearch(search);
                setSearch('');
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [nodes, search, setSearch, performSearch]);

    // Memoize node change function
    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onInit = useCallback((instance) => {
        reactFlowInstanceRef.current = instance;
    }, []);
    return (
        <>
            <Box sx={{ position: 'relative', height: 'calc(100vh - 80px)', width: '100%' }}>
                {loading && <Loading />}
                <Box
                    sx={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: theme.palette.background.paper !== '#fff'
                            ? theme.palette.background.paper
                            : '#c8c8c8',
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <ReactFlow
                        onInit={onInit}
                        nodes={nodes}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        defaultViewport={storedCenter}
                        snapToGrid
                    >
                        <Background />
                        <Controls
                            position={rtl ? 'bottom-right' : 'bottom-left'}
                            style={{
                                '--xy-controls-button-background-color-default':
                                    theme.palette.background.paper !== '#fff'
                                        ? theme.palette.custom.light
                                        : '#e9e9e9',
                                '--xy-controls-button-background-color-hover-default':
                                    theme.palette.background.paper !== '#fff'
                                        ? theme.palette.custom.dark
                                        : '#bfbcbc',
                                '--xy-controls-button-color-default': theme.palette.text.primary,
                                '--xy-controls-button-color-hover-default': 'inherit',
                                '--xy-controls-button-border-color-default': '#5c5c5c',
                            }} />
                    </ReactFlow>
                </Box>
                {auth && (
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={() => {
                            setDialogMode('create');
                            setDialogOpen(true);
                        }}
                        sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 999 }}
                    >
                        <AddIcon />
                    </Fab>
                )}
            </Box>
            <EntityDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setDialogMode(null);
                }}
                ModalProps={{ disableScrollLock: true }}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                mode={dialogMode}
                nodes={nodes}
                setNodes={setNodes}
                fetchNodes={fetchNodes}
            />
        </>
    );
}

export default function EntitiesWithProvider(props) {
    return (
        <ReactFlowProvider>
            <Entities {...props} />
        </ReactFlowProvider>
    );
}
