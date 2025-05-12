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

const AVG_CHAR_WIDTH = 8;           // Average width of a character in your font
const CARD_HORIZONTAL_PADDING = 20; // Total horizontal padding inside a card (left + right)
const CARD_TITLE_HEIGHT = 30;       // Height of the card's title/label area
const FIELD_ITEM_BASE_HEIGHT = 22;  // Base height for a single field item line
const FIELD_ITEM_LINE_SPACING = 4;  // Extra spacing if field text wraps
const CARD_VERTICAL_PADDING = 20;   // Total vertical padding inside a card (top + bottom)
const ICON_WIDTH_IF_PRESENT = 20; // If fields have icons, add space for them

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
        (text, avgCharWidth = 7, padding = 20) => text.length * avgCharWidth + padding,
        []
    );

    const getCardWidth = useCallback((entity, avgCharWidth = 7, padding = 20) => {
        return entity.fields.reduce(
            (maxWidth, field) => Math.max(maxWidth, approximateTextWidth(field.label, avgCharWidth)),
            approximateTextWidth(entity.label, avgCharWidth)
        ) + padding;
    }, [approximateTextWidth]);


    const getCardHeight = useCallback((entity, cardWidth) => {
        if (!entity || !entity.fields) return CARD_TITLE_HEIGHT + CARD_VERTICAL_PADDING;

        let fieldsTotalHeight = 0;
        const contentWidth = cardWidth - CARD_HORIZONTAL_PADDING; // Available width for text

        entity.fields.forEach(field => {
            const text = field.label || "";
            const textWidth = approximateTextWidth(text);
            // Estimate lines (simple version, for more accuracy use canvas measureText or an offscreen div)
            const lines = Math.max(1, Math.ceil(textWidth / contentWidth));
            fieldsTotalHeight += (lines * FIELD_ITEM_BASE_HEIGHT) + ((lines - 1) * FIELD_ITEM_LINE_SPACING);
        });

        return CARD_TITLE_HEIGHT + fieldsTotalHeight + CARD_VERTICAL_PADDING + (entity.fields.length > 0 ? (entity.fields.length - 1) * 5 : 0) /* small gap between fields */;
    }, []);

    const fetchNodes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
            // To use mock data for testing if API is not ready:
            // const data = getMockData();


            const itemsPerRow = 10;
            const horizontalGap = 40;
            const verticalGap = 30;
            const initialXOffset = 20;
            let currentYOffset = 20;
            let currentXInRow = initialXOffset;
            let maxHeightInCurrentRow = 0;

            const entityEntries = Object.entries(data);
            const newNodes = [];

            for (let i = 0; i < entityEntries.length; i++) {
                const [entityKey, entityValue] = entityEntries[i];
                // Ensure entityValue and entityValue.fields are valid
                const fields = (entityValue && Array.isArray(entityValue.fields)) ? entityValue.fields : [];
                const entityData = { label: entityKey, fields: fields };

                const cardWidth = getCardWidth(entityData);
                const cardHeight = getCardHeight(entityData, cardWidth);

                if (i > 0 && i % itemsPerRow === 0) { // Start a new row
                    currentXInRow = initialXOffset;
                    currentYOffset += maxHeightInCurrentRow + verticalGap;
                    maxHeightInCurrentRow = 0; // Reset for the new row
                }

                const nodeObject = {
                    id: entityKey,
                    type: 'entityCard', // Your custom node type
                    position: { x: currentXInRow, y: currentYOffset },
                    data: {
                        ...entityData,
                        onCopy: () => { setDialogMode('copy'); setDialogOpen(true); setSelectedNode(entityData); },
                        onEdit: () => { setDialogMode('edit'); setDialogOpen(true); setSelectedNode(entityData); },
                        onDelete: () => { setDialogMode('delete'); setDialogOpen(true); setSelectedNode(entityData); },
                        onMouseEnter: () => { setSelectedNode(entityData); },
                        onMouseLeave: () => { /* if (!dialogOpen) setSelectedNode(null); */ },
                        onEntityClick: (nodeLabel) => { performSearch(nodeLabel); },
                        onReport: () => { setDialogMode('report'); setDialogOpen(true); setSelectedNode(entityData); },
                    },
                    style: { // Pass width and height to your custom node
                        width: cardWidth,
                        height: cardHeight,
                    },
                };
                newNodes.push(nodeObject);

                currentXInRow += cardWidth + horizontalGap;
                maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, cardHeight);
            }

            setNodes(newNodes);
        } catch (error) {
            console.error('Error fetching entities:', error);
            setNodes([]);
        } finally {
            setLoading(false);
        }
    }, [
        getCardWidth,
        getCardHeight,
        performSearch,
        // setDialogMode, setDialogOpen, setSelectedNode // Add if they are props or could change
    ]);


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
