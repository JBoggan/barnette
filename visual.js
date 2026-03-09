var width = 960,
    height = 700

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var swap = [];

// State space exploration variables
var dfsRunning = false;
var dfsStopRequested = false;
var visitedStates = new Map();
var transformationGraph = { nodes: [], links: [] };
var stateIdCounter = 0;

const cubeGraphData = {
  "nodes":[
    {
      "id": 1,
      "name": "a",
      "group": 0,
      "x": 100,
      "y": 200
    },
    {
      "id": 2,
      "name": "b",
      "group": 2,
      "x": 600,
      "y": 200
    },
    {
      "id": 3,
      "name": "c",
      "group": 0,
      "x": 600,
      "y": 600
    },
    {
      "id": 4,
      "name": "d",
      "group": 0,
      "x": 100,
      "y": 600
    },
    {
      "id": 5,
      "name": "e",
      "group": 1,
      "x": 250,
      "y": 350
    },
    {
      "id": 6,
      "name": "f",
      "group": 0,
      "x": 450,
      "y": 350
    },
    {
      "id": 7,
      "name": "g",
      "group": 0,
      "x": 450,
      "y": 450
    },
    {
      "id": 8,
      "name": "h",
      "group": 1,
      "x": 250,
      "y": 450
    }
  ], "links":[    
      {
      "source": 1,
      "target": 2,
      "col": "green"
    },
    {
      "source": 2,
      "target": 3,
      "col": "red"
    },
    {
      "source": 3,
      "target": 4,
      "col": "green"
    },
    {
      "source": 4,
      "target": 1,
      "col": "red"
    },
    {
      "source": 5,
      "target": 6,
      "col": "green"
    },
    {
      "source": 6,
      "target": 7,
      "col": "red"
    },
    {
      "source": 7,
      "target": 8,
      "col": "green"
    },
    {
      "source": 8,
      "target": 5,
      "col": "red"
    },
    {
      "source": 1,
      "target": 5,
      "col": "blue"
    },
    {
      "source": 2,
      "target": 6,
      "col": "blue"
    },
    {
      "source": 3,
      "target": 7,
      "col": "blue"
    },
    {
      "source": 4,
      "target": 8,
      "col": "blue"
    }
  ]};

const dodecahedronGraphData = {
    "nodes": [
        {"id": 1, "name": "a", "group": 0, "x": 679, "y": 687},
        {"id": 2, "name": "b", "group": 0, "x": 121, "y": 682},
        {"id": 3, "name": "c", "group": 0, "x": 51, "y": 318},
        {"id": 4, "name": "d", "group": 0, "x": 414, "y": 127},
        {"id": 5, "name": "e", "group": 0, "x": 766, "y": 312},
        {"id": 6, "name": "f", "group": 1, "x": 652, "y": 354},
        {"id": 7, "name": "g", "group": 1, "x": 588, "y": 463},
        {"id": 8, "name": "h", "group": 1, "x": 504, "y": 450},
        {"id": 9, "name": "i", "group": 1, "x": 414, "y": 519},
        {"id": 10, "name": "j", "group": 1, "x": 336, "y": 451},
        {"id": 11, "name": "k", "group": 2, "x": 364, "y": 388},
        {"id": 12, "name": "l", "group": 2, "x": 480, "y": 382},
        {"id": 13, "name": "m", "group": 2, "x": 505, "y": 311},
        {"id": 14, "name": "n", "group": 2, "x": 411, "y": 228},
        {"id": 15, "name": "o", "group": 2, "x": 311, "y": 299},
        {"id": 16, "name": "p", "group": 3, "x": 183, "y": 356},
        {"id": 17, "name": "q", "group": 3, "x": 246, "y": 462},
        {"id": 18, "name": "r", "group": 3, "x": 230, "y": 603},
        {"id": 19, "name": "s", "group": 3, "x": 406, "y": 587},
        {"id": 20, "name": "t", "group": 3, "x": 565, "y": 602}
    ],
    "links": [
        {"source": 1, "target": 2, "col": "blue"},
        {"source": 2, "target": 3, "col": "green"},
        {"source": 3, "target": 4, "col": "blue"},
        {"source": 4, "target": 5, "col": "green"},
        {"source": 5, "target": 6, "col": "blue"},

        {"source": 6, "target": 7, "col": "green"},
        {"source": 7, "target": 8, "col": "blue"},
        {"source": 8, "target": 9, "col": "green"},
        {"source": 9, "target": 10, "col": "blue"},
        {"source": 10, "target": 11, "col": "green"},

        {"source": 11, "target": 12, "col": "blue"},
        {"source": 12, "target": 13, "col": "green"},
        {"source": 13, "target": 14, "col": "blue"},
        {"source": 14, "target": 15, "col": "green"},
        {"source": 15, "target": 16, "col": "blue"},

        {"source": 16, "target": 17, "col": "green"},
        {"source": 17, "target": 18, "col": "blue"},
        {"source": 18, "target": 19, "col": "green"},
        {"source": 19, "target": 20, "col": "blue"},
        {"source": 20, "target": 1, "col": "green"},

        {"source": 1, "target": 5, "col": "red"},
        {"source": 7, "target": 20, "col": "red"},
        {"source": 17, "target": 10, "col": "red"},
        {"source": 9, "target": 19, "col": "red"},
        {"source": 15, "target": 11, "col": "red"},

        {"source": 2, "target": 18, "col": "red"},
        {"source": 3, "target": 16, "col": "red"},
        {"source": 4, "target": 14, "col": "red"},
        {"source": 6, "target": 13, "col": "red"},
        {"source": 8, "target": 12, "col": "red"}
    ]
};

var json = JSON.parse(JSON.stringify(cubeGraphData));

var edges = [];
var   fill = d3.scale.category20();

json.links.forEach(function(e) { 
    // Get the source and target nodes
    var sourceNode = json.nodes.filter(function(n) { return n.id === e.source; })[0],
        targetNode = json.nodes.filter(function(n) { return n.id === e.target; })[0],
        col = e.col;

    // Add the edge to the array
    edges.push({source: sourceNode, target: targetNode, col: col});
});

// Create a custom drag behavior without force simulation
var drag = d3.behavior.drag()
    .on("drag", function(d) {
        d.x = d3.event.x;
        d.y = d3.event.y;
        
        // Update the visual position of the node
        d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
        
        // Update connected edges
        link.filter(function(l) { return l.source === d || l.target === d; })
            .attr("x1", function(l) { return l.source.x; })
            .attr("y1", function(l) { return l.source.y; })
            .attr("x2", function(l) { return l.target.x; })
            .attr("y2", function(l) { return l.target.y; });
            
        // Update edge labels
        labels.filter(function(l) { return l.source === d || l.target === d; })
            .attr("x", function(l) { return (l.source.x + l.target.x + 10) / 2; })
            .attr("y", function(l) { return (l.source.y + l.target.y + 10) / 2; });
    });

  var link = svg.selectAll("link")
      .data(edges)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke", function(d) {
        return d.col;
       })
      .style("stroke-width", 3)
      .on("click", function(d) {
        selectEdge(d3.select(this), d);
      });



  //.append("circle").attr("r", 5)
  var node = svg.selectAll("node")
      .data(json.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("fill", function(d) {
        return fill(d.group);
       }).on("dblclick", dblclick)
      .on("click", function(d) { selectVertex(d3.select(this), d); })
      .call(drag);

/*
  node.append("image")
      .attr("xlink:href", "https://github.com/favicon.ico")
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 16);
*/
  node.append("circle").attr("r", 5);

  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

  // přidá popisky k hranám
  var labels = svg.selectAll('text')
    .data(edges)
  .enter().append('text')
    .attr("x", function(d) { return (d.source.y + d.target.y) / 2; }) 
    .attr("y", function(d) { return (d.source.x + d.target.x) / 2; }) 
    .attr("text-anchor", "middle") 
    .text(function(d) {return d.count;}); 


  // Set initial positions for links and labels
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
      
  labels.attr("x", function(d) { return (d.source.x + d.target.x + 10) / 2; }) 
      .attr("y", function(d) { return (d.source.y + d.target.y + 10) / 2; });







    var linkedByIndex = {};
    edges.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

  function clickCycle(e) {
   /* if(swap.length == 2) {
      var firstColor = swap[0].stroke;
      var secondColor = swap[1].stroke;
      d3.select(this).style("stroke", function)
    
    }
    else {
      swap.push(e);
    }
    */
  //d3.select(this).style("stroke", function(e) {
  //      return 'purple';
  //     });
  }
  
  function inducedCycle(e1, e2) {
    col1 = e1.col;
    col2 = e2.col;
    //stuff
  }
  
  function adjacentEdges(edge) {
  
  }

  function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}



// Helper function to check if point q lies on segment pr
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
       return true;
    return false;
}

// To find orientation of ordered triplet (p, q, r).
// Returns:
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    var val = (q.y - p.y) * (r.x - q.x) -
              (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0;  // collinear
    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function segmentsIntersect(p1, q1, p2, q2) {
    // Find the four orientations needed for general case
    var o1 = orientation(p1, q1, p2);
    var o2 = orientation(p1, q1, q2);
    var o3 = orientation(p2, q2, p1);
    var o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

     // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

// Global variables for edge selection
var selectedEdges = [];
var selectedVertex = null;
var nextNodeId = 9; // Start after existing nodes
var previousState = null;
var uniqueSpans = [];

document.addEventListener('DOMContentLoaded', (event) => {
    recalculateAllCycles();
    
    const edgeTransformBtn = document.getElementById('edgeTransformBtn');
    if (edgeTransformBtn) {
        edgeTransformBtn.addEventListener('click', performEdgeTransformation);
    }

    const vertexTransformBtn = document.getElementById('vertexTransformBtn');
    if (vertexTransformBtn) {
        vertexTransformBtn.addEventListener('click', performVertexTransformation);
    }

    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', undoTransformation);
    }

    const reloadCubeBtn = document.getElementById('reloadCubeBtn');
    if (reloadCubeBtn) {
        reloadCubeBtn.addEventListener('click', () => loadGraph(cubeGraphData));
    }
    
    const reloadDodecahedronBtn = document.getElementById('reloadDodecahedronBtn');
    if (reloadDodecahedronBtn) {
        reloadDodecahedronBtn.addEventListener('click', () => loadGraph(dodecahedronGraphData));
    }

    const dfsBtn = document.getElementById('dfsBtn');
    if (dfsBtn) {
        dfsBtn.addEventListener('click', startDFS);
    }

    const stopDfsBtn = document.getElementById('stopDfsBtn');
    if (stopDfsBtn) {
        stopDfsBtn.addEventListener('click', stopDFS);
    }

    const renderGraphBtn = document.getElementById('renderGraphBtn');
    if (renderGraphBtn) {
        renderGraphBtn.addEventListener('click', renderTransformationGraph);
    }

    const clearGraphRenderBtn = document.getElementById('clearGraphRenderBtn');
    if (clearGraphRenderBtn) {
        clearGraphRenderBtn.addEventListener('click', clearTransformationGraphRender);
    }

    initializeTransformationGraph();
    updateDebugInfo();
});

function selectEdge(edgeElement, edgeData) {
    const index = selectedEdges.findIndex(e => e === edgeData);
    
    if (index === -1) {
        // Add edge to selection if we have less than 2
        if (selectedEdges.length < 2) {
            selectedEdges.push(edgeData);
            edgeElement.style("stroke-width", 6)
                      .style("filter", "drop-shadow(0 0 8px " + edgeData.col + ")");
        }
    } else {
        // Remove edge from selection
        selectedEdges.splice(index, 1);
        edgeElement.style("stroke-width", 3)
                  .style("filter", "none");
    }
    
    updateSelectionInfo();
}

function selectVertex(vertexElement, vertexData) {
    // Clear any selected edges first
    selectedEdges = [];
    link.style("stroke-width", 3).style("filter", "none");
    
    if (selectedVertex === vertexData) {
        // Deselect if clicking the same vertex
        selectedVertex = null;
        vertexElement.select("circle")
            .attr("r", 5)
            .style("stroke", "none")
            .style("stroke-width", 0);
    } else {
        // Clear previous vertex selection
        if (selectedVertex) {
            node.filter(function(d) { return d === selectedVertex; })
                .select("circle")
                .attr("r", 5)
                .style("stroke", "none")
                .style("stroke-width", 0);
        }
        
        // Select new vertex
        selectedVertex = vertexData;
        vertexElement.select("circle")
            .attr("r", 8)
            .style("stroke", "orange")
            .style("stroke-width", 3);
    }
    
    updateSelectionInfo();
}

function updateSelectionInfo() {
    const infoDiv = document.getElementById('selectionInfo');
    if (selectedVertex) {
        infoDiv.textContent = `Selected vertex: ${selectedVertex.name}`;
    } else if (selectedEdges.length === 0) {
        infoDiv.textContent = "Select 2 edges for edge transform or 1 vertex for vertex transform";
    } else if (selectedEdges.length === 1) {
        const edge = selectedEdges[0];
        infoDiv.textContent = `Selected edge: ${edge.source.name}-${edge.target.name}`;
    } else {
        const edge1 = selectedEdges[0];
        const edge2 = selectedEdges[1];
        infoDiv.textContent = `Selected edges: ${edge1.source.name}-${edge1.target.name}, ${edge2.source.name}-${edge2.target.name}`;
    }
    
    updateDebugInfo();
}

function findFaces(nodes, allEdges) {
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));
    allEdges.forEach(e => {
        adj.get(e.source.id).push(e.target);
        adj.get(e.target.id).push(e.source);
    });

    const sortedNeighbors = new Map();
    nodes.forEach(node => {
        const neighbors = adj.get(node.id);
        if (!neighbors) return;
        neighbors.sort((a, b) => {
            const angleA = Math.atan2(a.y - node.y, a.x - node.x);
            const angleB = Math.atan2(b.y - node.y, b.x - node.x);
            return angleA - angleB;
        });
        sortedNeighbors.set(node.id, neighbors);
    });

    const visitedDarts = new Set(); // e.g., 'u.id-v.id'
    const faces = [];

    allEdges.forEach(edge => {
        const darts = [
            { u: edge.source, v: edge.target },
            { u: edge.target, v: edge.source }
        ];

        darts.forEach(dart => {
            const dartId = `${dart.u.id}-${dart.v.id}`;
            if (!visitedDarts.has(dartId)) {
                const currentFaceEdges = [];
                const currentFaceNodes = [];
                let currentU = dart.u;
                let currentV = dart.v;

                while (!visitedDarts.has(`${currentU.id}-${currentV.id}`)) {
                    visitedDarts.add(`${currentU.id}-${currentV.id}`);
                    currentFaceNodes.push(currentU);
                    
                    const faceEdge = allEdges.find(e => 
                        (e.source.id === currentU.id && e.target.id === currentV.id) ||
                        (e.source.id === currentV.id && e.target.id === currentU.id)
                    );
                    if (faceEdge) currentFaceEdges.push(faceEdge);

                    const neighborsOfV = sortedNeighbors.get(currentV.id);
                    if (!neighborsOfV) break;

                    const prevIndex = neighborsOfV.findIndex(n => n.id === currentU.id);
                    const nextNode = neighborsOfV[(prevIndex - 1 + neighborsOfV.length) % neighborsOfV.length];
                    
                    currentU = currentV;
                    currentV = nextNode;
                }
                
                if (currentFaceEdges.length > 0) {
                    faces.push({ edges: currentFaceEdges, nodes: currentFaceNodes });
                }
            }
        });
    });

    return faces;
}

function updateDebugInfo() {
    const debugDiv = document.getElementById('debugContent');
    if (!debugDiv) return;
    
    let debugText = `Nodes: ${json.nodes.map(n => n.name).join(', ')}\n\n`;
    debugText += `Edges (${json.links.length}):\n`;
    
    json.links.forEach((link, index) => {
        const sourceNode = json.nodes.find(n => n.id === link.source);
        const targetNode = json.nodes.find(n => n.id === link.target);
        debugText += `${index}: ${sourceNode.name}-${targetNode.name} (${link.col})\n`;
    });
    
    debugDiv.textContent = debugText;
}

function getNextNodeName(count = 4) {
    const existingNames = json.nodes.map(n => n.name);
    
    // Helper to convert base-26-like names ('a', 'z', 'aa') to numbers (1, 26, 27)
    function nameToNumber(name) {
        let num = 0;
        for (let i = 0; i < name.length; i++) {
            num = num * 26 + (name.charCodeAt(i) - 'a'.charCodeAt(0) + 1);
        }
        return num;
    }

    // Helper to convert a number back to a base-26-like name
    function numberToName(num) {
        let name = '';
        while (num > 0) {
            let rem = num % 26;
            if (rem === 0) {
                name = 'z' + name;
                num = Math.floor(num / 26) - 1;
            } else {
                name = String.fromCharCode(rem - 1 + 'a'.charCodeAt(0)) + name;
                num = Math.floor(num / 26);
            }
        }
        return name || 'a';
    }

    // Find the highest numerical value among existing node names
    let maxNum = 0;
    existingNames.forEach(name => {
        const currentNum = nameToNumber(name);
        if (currentNum > maxNum) {
            maxNum = currentNum;
        }
    });

    // Generate the next 'count' names by incrementing the max number
    const nextNames = [];
    for (let i = 1; i <= count; i++) {
        nextNames.push(numberToName(maxNum + i));
    }

    return nextNames;
}

function performEdgeTransformation() {
    if (selectedEdges.length !== 2) {
        alert("Please select exactly 2 edges to transform.");
        return;
    }

    // Save the current state before transforming for undo functionality
    previousState = {
        nodes: JSON.parse(JSON.stringify(json.nodes)),
        links: JSON.parse(JSON.stringify(json.links))
    };

    const faces = findFaces(json.nodes, edges);
    const edge1 = selectedEdges[0];
    const edge2 = selectedEdges[1];

    let targetFace = null;
    for (const face of faces) {
        if (face.edges.includes(edge1) && face.edges.includes(edge2)) {
            targetFace = face;
            break;
        }
    }

    if (!targetFace) {
        alert("Selected edges do not lie on the same face.");
        return;
    }
    
    // Get the 4 nodes involved in the transformation
    let a = edge1.source;
    let b = edge1.target;
    let c = edge2.source;
    let d = edge2.target;

    // Check orientation
    const nodeSeq = targetFace.nodes.map(n => n.id);
    const idxA = nodeSeq.indexOf(a.id);
    const idxB = nodeSeq.indexOf(b.id);
    const idxC = nodeSeq.indexOf(c.id);
    const idxD = nodeSeq.indexOf(d.id);

    const isForwardAB = (idxA + 1) % nodeSeq.length === idxB;
    const isForwardCD = (idxC + 1) % nodeSeq.length === idxD;

    if (isForwardAB === isForwardCD) {
        // If orientations match, swap c and d to make them opposite
        [c, d] = [d, c];
    }
    
    // Remove the selected edges from the graph data arrays
    edges = edges.filter(e => e !== edge1 && e !== edge2);
    json.links = json.links.filter(l => {
        const isEdge1 = (l.source === edge1.source.id && l.target === edge1.target.id) || (l.source === edge1.target.id && l.target === edge1.source.id);
        const isEdge2 = (l.source === edge2.source.id && l.target === edge2.target.id) || (l.source === edge2.target.id && l.target === edge2.source.id);
        return !(isEdge1 || isEdge2);
    });
    
    // Generate names for the 4 new nodes
    const newNames = getNextNodeName();
    const i = newNames[0];
    const j = newNames[1];
    const k = newNames[2];
    const l = newNames[3];
    
    // Create 4 new nodes
    const newNodeI = { id: nextNodeId++, name: i, group: 0, x: (2*a.x + b.x) / 3, y: (2*a.y + b.y) / 3 };
    const newNodeJ = { id: nextNodeId++, name: j, group: 0, x: (a.x + 2*b.x) / 3, y: (a.y + 2*b.y) / 3 };
    const newNodeK = { id: nextNodeId++, name: k, group: 0, x: (2*c.x + d.x) / 3, y: (2*c.y + d.y) / 3 };
    const newNodeL = { id: nextNodeId++, name: l, group: 0, x: (c.x + 2*d.x) / 3, y: (c.y + 2*d.y) / 3 };
    
    // Add new nodes to the graph
    json.nodes.push(newNodeI, newNodeJ, newNodeK, newNodeL);
    
    // Create the 8 new edges based on the colors of the selected edges
    const color1 = edge1.col;
    const color2 = edge2.col;
    const allColors = ['red', 'green', 'blue'];
    let newEdges;

    if (color1 === color2) {
        // Case 1: Selected edges have the same color
        const primaryColor = color1;
        const otherColors = allColors.filter(c => c !== primaryColor);
        const secondaryColor = otherColors[0];
        const tertiaryColor = otherColors[1];

        newEdges = [
            { source: a, target: newNodeI, col: primaryColor },
            { source: newNodeI, target: newNodeJ, col: secondaryColor },
            { source: newNodeJ, target: b, col: primaryColor },
            { source: newNodeI, target: newNodeK, col: tertiaryColor },
            { source: newNodeJ, target: newNodeL, col: tertiaryColor },
            { source: c, target: newNodeK, col: primaryColor },
            { source: newNodeK, target: newNodeL, col: secondaryColor },
            { source: newNodeL, target: d, col: primaryColor }
        ];
    } else {
        // Case 2: Selected edges have different colors
        const tertiaryColor = allColors.filter(c => c !== color1 && c !== color2)[0];

        newEdges = [
            { source: a, target: newNodeI, col: color1 }, // a-b color
            { source: newNodeI, target: newNodeJ, col: color2 }, // c-d color
            { source: newNodeJ, target: b, col: color1 }, // a-b color
            { source: newNodeI, target: newNodeK, col: tertiaryColor },
            { source: newNodeJ, target: newNodeL, col: tertiaryColor },
            { source: c, target: newNodeK, col: color2 }, // c-d color
            { source: newNodeK, target: newNodeL, col: color1 }, // a-b color
            { source: newNodeL, target: d, col: color2 } // c-d color
        ];
    }
    
    // Add new edges to the graph
    edges.push(...newEdges);
    
    // Add new edges to json.links
    newEdges.forEach(edge => {
        json.links.push({
            source: edge.source.id,
            target: edge.target.id,
            col: edge.col
        });
    });
    
    // Clear selection
    selectedEdges = [];
    updateSelectionInfo();
    
    // Redraw the entire graph
    redrawGraph();
    
    // Recalculate all cycles and clear spans
    uniqueSpans = [];
    recalculateAllCycles();
    renderSpanCounts(); // Clear counts
    
    // Enable the undo button
    document.getElementById('undoBtn').disabled = false;
}

function performVertexTransformation() {
    if (!selectedVertex) {
        alert("Please select exactly 1 vertex to transform.");
        return;
    }

    // Save the current state before transforming for undo functionality
    previousState = {
        nodes: JSON.parse(JSON.stringify(json.nodes)),
        links: JSON.parse(JSON.stringify(json.links))
    };

    const a = selectedVertex;
    
    // Find all edges connected to vertex a
    const connectedEdges = edges.filter(e => 
        e.source.id === a.id || e.target.id === a.id
    );
    
    if (connectedEdges.length !== 3) {
        alert("Selected vertex must have exactly 3 edges (degree 3).");
        return;
    }
    
    // Get the three neighbors and their edge colors
    const neighbors = connectedEdges.map(e => {
        if (e.source.id === a.id) {
            return { node: e.target, color: e.col, edge: e };
        } else {
            return { node: e.source, color: e.col, edge: e };
        }
    });
    
    // Sort neighbors by color to ensure consistent ordering (red, green, blue)
    const colorOrder = { 'red': 0, 'green': 1, 'blue': 2 };
    neighbors.sort((n1, n2) => colorOrder[n1.color] - colorOrder[n2.color]);
    
    const b = neighbors[0].node;  // red neighbor
    const c = neighbors[1].node;  // green neighbor
    const d = neighbors[2].node;  // blue neighbor
    const colorAB = neighbors[0].color;
    const colorAC = neighbors[1].color;
    const colorAD = neighbors[2].color;
    
    // Generate names for the 2 new nodes (a stays, e and f are new)
    const newNames = getNextNodeName(2);
    const eName = newNames[0];
    const fName = newNames[1];
    
    // Position the new nodes in a small triangle around the original vertex
    const radius = 20;
    const angle1 = 0;
    const angle2 = 2 * Math.PI / 3;
    const angle3 = 4 * Math.PI / 3;
    
    // Keep 'a' at original position
    const newNodeE = { 
        id: nextNodeId++, 
        name: eName, 
        group: a.group, 
        x: a.x + radius * Math.cos(angle2), 
        y: a.y + radius * Math.sin(angle2) 
    };
    const newNodeF = { 
        id: nextNodeId++, 
        name: fName, 
        group: a.group, 
        x: a.x + radius * Math.cos(angle3), 
        y: a.y + radius * Math.sin(angle3) 
    };
    
    // Remove the old edges from vertex a
    edges = edges.filter(e => !connectedEdges.includes(e));
    json.links = json.links.filter(l => {
        return !connectedEdges.some(ce => 
            (l.source === ce.source.id && l.target === ce.target.id) ||
            (l.source === ce.target.id && l.target === ce.source.id)
        );
    });
    
    // Add new nodes to the graph
    json.nodes.push(newNodeE, newNodeF);
    
    // Create the new edges according to the specification
    // Triangle edges: a-e (blue), a-f (red), e-f (green)
    // External edges: a-b (green), e-c (red), f-d (blue)
    const newEdges = [
        { source: a, target: newNodeE, col: colorAD },     // a-e is blue (opposite of a-d)
        { source: a, target: newNodeF, col: colorAC },     // a-f is red (opposite of a-c)
        { source: newNodeE, target: newNodeF, col: colorAB }, // e-f is green (opposite of a-b)
        { source: a, target: b, col: colorAB },            // a-b keeps its color (green)
        { source: newNodeE, target: c, col: colorAC },     // e-c gets a-c's color (red)
        { source: newNodeF, target: d, col: colorAD }      // f-d gets a-d's color (blue)
    ];
    
    // Add new edges to the graph
    edges.push(...newEdges);
    
    // Add new edges to json.links
    newEdges.forEach(edge => {
        json.links.push({
            source: edge.source.id,
            target: edge.target.id,
            col: edge.col
        });
    });
    
    // Clear selection
    selectedVertex = null;
    updateSelectionInfo();
    
    // Redraw the entire graph
    redrawGraph();
    
    // Recalculate all cycles and clear spans
    uniqueSpans = [];
    recalculateAllCycles();
    renderSpanCounts();
    
    // Enable the undo button
    document.getElementById('undoBtn').disabled = false;
}

function loadGraph(graphData) {
    json = JSON.parse(JSON.stringify(graphData));
    
    edges = [];
    json.links.forEach(function(e) { 
        var sourceNode = json.nodes.find(function(n) { return n.id === e.source; });
        var targetNode = json.nodes.find(function(n) { return n.id === e.target; });
        if (sourceNode && targetNode) {
            edges.push({source: sourceNode, target: targetNode, col: e.col});
        }
    });

    nextNodeId = (json.nodes.length > 0) ? Math.max(...json.nodes.map(n => n.id)) + 1 : 1;

    previousState = null;
    document.getElementById('undoBtn').disabled = true;

    selectedEdges = [];
    selectedVertex = null;
    if (typeof link !== 'undefined' && link) {
        link.style("stroke-width", 3).style("filter", "none");
    }
    if (typeof node !== 'undefined' && node) {
        node.select("circle").attr("r", 5).style("stroke", "none").style("stroke-width", 0);
    }
    updateSelectionInfo();

    redrawGraph();
    uniqueSpans = [];
    recalculateAllCycles();
    renderSpanCounts();
    updateDebugInfo();
    
    visitedStates.clear();
    transformationGraph = { nodes: [], links: [] };
    stateIdCounter = 0;
    
    const initialState = cloneGraphState();
    const initialHash = getStateHash(initialState.nodes, initialState.links);
    
    const initialStateNode = {
        id: stateIdCounter++,
        hash: initialHash,
        state: initialState,
        depth: 0
    };
    
    visitedStates.set(initialHash, initialStateNode);
    transformationGraph.nodes.push(initialStateNode);
    
    updateTransformationGraphInfo();
}

function undoTransformation() {
    if (!previousState) {
        console.warn("No previous state to undo to.");
        return;
    }

    // Restore the graph using the new loadGraph function
    loadGraph(previousState);
}

function redrawGraph() {
    // Remove existing elements
    svg.selectAll(".link").remove();
    svg.selectAll(".node").remove();
    svg.selectAll("text").filter(function() { return d3.select(this).attr("text-anchor") === "middle"; }).remove();
    
    // Redraw links
    link = svg.selectAll("link")
        .data(edges)
      .enter().append("line")
        .attr("class", "link")
        .style("stroke", function(d) { return d.col; })
        .style("stroke-width", 3)
        .on("click", function(d) { selectEdge(d3.select(this), d); });
    
    // Redraw nodes
    node = svg.selectAll("node")
        .data(json.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style("fill", function(d) { return fill(d.group); })
        .on("dblclick", dblclick)
        .on("click", function(d) { selectVertex(d3.select(this), d); })
        .call(drag);
    
    node.append("circle").attr("r", 5);
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });
    
    // Redraw edge labels
    labels = svg.selectAll('text')
      .data(edges)
    .enter().append('text')
      .attr("x", function(d) { return (d.source.x + d.target.x + 10) / 2; }) 
      .attr("y", function(d) { return (d.source.y + d.target.y + 10) / 2; }) 
      .attr("text-anchor", "middle") 
      .text(function(d) { return d.count; });
    
    // Set initial positions
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
        
    labels.attr("x", function(d) { return (d.source.x + d.target.x + 10) / 2; }) 
        .attr("y", function(d) { return (d.source.y + d.target.y + 10) / 2; });
}

function displayTwoColorAlternatingCycles(color1, color2, containerId) {
    const containerDiv = document.getElementById(containerId);
    if (!containerDiv) return;

    const cycles = findAlternatingCycles(json.nodes, edges, color1, color2);

    // Clear previous results but keep the header
    const header = containerDiv.querySelector('h3');
    const originalTitle = header.textContent.split(' (')[0]; // Grabs the base title
    header.textContent = `${originalTitle} (${cycles.length})`;

    // Remove only old cycle buttons and messages
    containerDiv.querySelectorAll('button, p').forEach(el => el.remove());

    if (cycles.length === 0) {
        const noCyclesMsg = document.createElement('p');
        noCyclesMsg.textContent = 'No such cycles found.';
        noCyclesMsg.style.margin = '10px 0';
        containerDiv.appendChild(noCyclesMsg);
        return;
    }

    cycles.forEach((cycle, index) => {
        const button = document.createElement('button');
        button.textContent = cycle.map(node => node.name).join(' → ') + ' → ' + cycle[0].name;
        button.style.cssText = 'display: block; width: 100%; margin: 5px 0; padding: 6px; font-size: 11px; border: 1px solid #ccc; border-radius: 4px; background-color: white; cursor: pointer;';
        button.addEventListener('click', () => swapCycleColors(cycle, color1, color2));
        containerDiv.appendChild(button);
    });
}

function findAlternatingCycles(nodes, allEdges, color1, color2) {
    const foundCycles = [];
    const adj = new Map(); // Adjacency list: node.id -> [{node: neighborNode, color: edgeColor}]

    allEdges.forEach(edge => {
        if (!adj.has(edge.source.id)) adj.set(edge.source.id, []);
        if (!adj.has(edge.target.id)) adj.set(edge.target.id, []);
        adj.get(edge.source.id).push({ node: edge.target, color: edge.col });
        adj.get(edge.target.id).push({ node: edge.source, color: edge.col }); // Assuming undirected for path finding
    });

    nodes.forEach(startNode => {
        dfsFindCycles(startNode, startNode, [startNode], color1, color2, adj, foundCycles, new Set());
    });
    
    // Filter out duplicate cycles (e.g. A->B->C->A is same as B->C->A->B)
    return uniqueCycles(foundCycles);
}

function dfsFindCycles(currentNode, targetNode, currentPath, expectedColor, otherColor, adj, foundCycles, visitedEdges) {
    if (!adj.has(currentNode.id)) return;

    const neighbors = adj.get(currentNode.id);

    for (const neighborEdge of neighbors) {
        const neighborNode = neighborEdge.node;
        const edgeColor = neighborEdge.color;

        // Check if edge color matches expected color
        if (edgeColor !== expectedColor) continue;
        
        // Check if we've reached the target node (completing a cycle)
        if (neighborNode.id === targetNode.id && currentPath.length > 1) {
            // Ensure the cycle has even length to properly alternate colors
            if (currentPath.length % 2 === 0) { 
                foundCycles.push([...currentPath]);
            }
            // Continue searching for longer cycles
        }

        // Only continue if the neighbor is not already in the current path
        // This ensures each node appears only once in the cycle
        if (!currentPath.find(pathNode => pathNode.id === neighborNode.id)) {
            currentPath.push(neighborNode);
            dfsFindCycles(neighborNode, targetNode, currentPath, otherColor, expectedColor, adj, foundCycles, visitedEdges);
            currentPath.pop(); // Backtrack
        }
    }
}

function uniqueCycles(cycles) {
    const unique = [];
    const seenNodes = new Set();

    cycles.forEach(cycle => {
        if (cycle.length === 0) return;
        
        // Check if the first node of this cycle has been seen before
        const firstNodeName = cycle[0].name;
        if (seenNodes.has(firstNodeName)) {
            // We've already seen a cycle starting with this node, so skip this cycle
            return;
        }
        
        // Add all nodes in this cycle to the seen set
        cycle.forEach(node => {
            seenNodes.add(node.name);
        });
        
        // Add this cycle to our unique cycles
        unique.push(cycle);
    });
    
    return unique;
}

function swapCycleColors(cycle, color1, color2) {
    const beforeState = cloneGraphState();
    const beforeHash = getStateHash(beforeState.nodes, beforeState.links);
    
    const cycleEdges = [];
    
    for (let i = 0; i < cycle.length; i++) {
        const currentNode = cycle[i];
        const nextNode = cycle[(i + 1) % cycle.length];
        
        const edge = edges.find(e => 
            (e.source.id === currentNode.id && e.target.id === nextNode.id) ||
            (e.source.id === nextNode.id && e.target.id === currentNode.id)
        );
        
        if (edge) {
            cycleEdges.push(edge);
        }
    }
    
    cycleEdges.forEach(edge => {
        const oldColor = edge.col;
        const newColor = (oldColor === color1) ? color2 : color1;
        edge.col = newColor;
        
        const jsonLink = json.links.find(l => 
            (l.source === edge.source.id && l.target === edge.target.id) ||
            (l.source === edge.target.id && l.target === edge.source.id)
        );
        if (jsonLink) {
            jsonLink.col = newColor;
        }
    });
    
    link.style("stroke", function(d) {
        return d.col;
    });
    
    recalculateAllCycles();
    
    const afterState = cloneGraphState();
    const afterHash = getStateHash(afterState.nodes, afterState.links);
    
    addStateTransition(beforeState, beforeHash, afterState, afterHash, cycle, color1, color2);
}

function recalculateAllCycles() {
    // Recalculate and display cycles for all three color combinations
    displayTwoColorAlternatingCycles('red', 'blue', 'redBlueCycles');
    displayTwoColorAlternatingCycles('red', 'green', 'redGreenCycles');
    displayTwoColorAlternatingCycles('blue', 'green', 'blueGreenCycles');
    updateSpans('red', 'blue');
    updateSpans('red', 'green');
    updateSpans('blue', 'green');
}

function getCurrentSpan() {
    const redBlueCycles = findAlternatingCycles(json.nodes, edges, 'red', 'blue');
    const redGreenCycles = findAlternatingCycles(json.nodes, edges, 'red', 'green');
    const blueGreenCycles = findAlternatingCycles(json.nodes, edges, 'blue', 'green');
    return [...redBlueCycles, ...redGreenCycles, ...blueGreenCycles];
}

function getCanonicalSpanId(span) {
    if (!span || span.length === 0) {
        return 'empty';
    }
    
    const canonicalCycles = span.map(cycle => {
        const cycleNodeNames = cycle.map(node => node.name);
        const reversedCycleNodeNames = cycleNodeNames.slice().reverse();

        let canonicalRepresentation = cycleNodeNames.join(',');

        // Check forward rotations
        for (let i = 1; i < cycleNodeNames.length; i++) {
            const rotation = [...cycleNodeNames.slice(i), ...cycleNodeNames.slice(0, i)].join(',');
            if (rotation < canonicalRepresentation) {
                canonicalRepresentation = rotation;
            }
        }

        // Check reverse rotations
        for (let i = 0; i < reversedCycleNodeNames.length; i++) {
            const rotation = [...reversedCycleNodeNames.slice(i), ...reversedCycleNodeNames.slice(0, i)].join(',');
            if (rotation < canonicalRepresentation) {
                canonicalRepresentation = rotation;
            }
        }

        return canonicalRepresentation;
    });

    // Sort the canonical representations of the cycles to create a canonical span ID
    canonicalCycles.sort();
    return canonicalCycles.join(';');
}

function updateSpans(color1, color2) {
    const currentSpan = findAlternatingCycles(json.nodes, edges, color1, color2);
    if (currentSpan.length === 0) return;

    const spanId = getCanonicalSpanId(currentSpan);
    const isUnique = !uniqueSpans.some(s => s.id === spanId);

    if (isUnique) {
        uniqueSpans.push({ id: spanId, span: currentSpan });
        renderSpans();
        renderSpanCounts();
    }
}

function renderSpans() {
    const spansContainer = document.getElementById('spansContainer');
    if (!spansContainer) return;

    const header = spansContainer.querySelector('h3');
    const originalTitle = header.textContent.split(' (')[0];
    header.textContent = `${originalTitle} (${uniqueSpans.length})`;

    // Clear only the span items, not the header
    spansContainer.querySelectorAll('.span-item').forEach(el => el.remove());

    uniqueSpans.forEach((spanData, index) => {
        const spanDiv = document.createElement('div');
        spanDiv.className = 'span-item';
        spanDiv.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #aaa; border-radius: 4px; background-color: white;';
        
        const spanTitle = document.createElement('strong');
        spanTitle.textContent = `Span ${index + 1} (${spanData.span.length} cycles)`;
        spanDiv.appendChild(spanTitle);

        spanData.span.forEach(cycle => {
            const cycleP = document.createElement('p');
            const cycleText = cycle.map(n => n.name).join(' → ') + ' → ' + cycle[0].name;
            cycleP.textContent = cycleText;
            cycleP.style.cssText = 'margin: 2px 0; font-size: 10px;';
            spanDiv.appendChild(cycleP);
        });

        spansContainer.appendChild(spanDiv);
    });
}

function renderSpanCounts() {
    const countsContainer = document.getElementById('spanCountsContainer');
    if (!countsContainer) return;

    // Tally the counts
    const counts = uniqueSpans.reduce((acc, { span }) => {
        const numCycles = span.length;
        acc[numCycles] = (acc[numCycles] || 0) + 1;
        return acc;
    }, {});

    // Clear previous counts, but keep the header
    const header = countsContainer.querySelector('h3');
    countsContainer.innerHTML = ''; 
    countsContainer.appendChild(header);

    // Get sorted keys
    const sortedCounts = Object.keys(counts).sort((a, b) => a - b);

    // Display new counts
    sortedCounts.forEach(numCycles => {
        const count = counts[numCycles];
        const p = document.createElement('p');
        p.style.margin = '4px 0';
        p.style.fontSize = '12px';
        const plural = count > 1 ? 's' : '';
        const cyclePlural = numCycles > 1 ? 's' : '';
        p.textContent = `${count} span${plural} w/ ${numCycles} cycle${cyclePlural}`;
        countsContainer.appendChild(p);
    });
}

function initializeTransformationGraph() {
    visitedStates.clear();
    transformationGraph = { nodes: [], links: [] };
    stateIdCounter = 0;
    
    const initialState = cloneGraphState();
    const initialHash = getStateHash(initialState.nodes, initialState.links);
    
    const initialStateNode = {
        id: stateIdCounter++,
        hash: initialHash,
        state: initialState,
        depth: 0
    };
    
    visitedStates.set(initialHash, initialStateNode);
    transformationGraph.nodes.push(initialStateNode);
    
    updateTransformationGraphInfo();
}

function addStateTransition(beforeState, beforeHash, afterState, afterHash, cycle, color1, color2) {
    let beforeNode = visitedStates.get(beforeHash);
    
    if (!beforeNode) {
        beforeNode = {
            id: stateIdCounter++,
            hash: beforeHash,
            state: beforeState,
            depth: 0
        };
        visitedStates.set(beforeHash, beforeNode);
        transformationGraph.nodes.push(beforeNode);
    }
    
    let afterNode = visitedStates.get(afterHash);
    
    if (!afterNode) {
        afterNode = {
            id: stateIdCounter++,
            hash: afterHash,
            state: afterState,
            depth: beforeNode.depth + 1
        };
        visitedStates.set(afterHash, afterNode);
        transformationGraph.nodes.push(afterNode);
    }
    
    const alreadyHasEdge = transformationGraph.links.some(link => 
        (link.source.id === beforeNode.id && link.target.id === afterNode.id) ||
        (link.source.id === afterNode.id && link.target.id === beforeNode.id)
    );
    
    if (!alreadyHasEdge) {
        const cycleDesc = cycle.map(n => n.name).join('→');
        const transformationEdge = {
            source: beforeNode,
            target: afterNode,
            transformation: {
                cycle: cycleDesc,
                colors: `${color1}/${color2}`
            }
        };
        transformationGraph.links.push(transformationEdge);
    }
    
    updateTransformationGraphInfo();
}

function updateTransformationGraphInfo() {
    const graphInfoDiv = document.getElementById('transformationGraphInfo');
    if (graphInfoDiv) {
        const depthCounts = {};
        transformationGraph.nodes.forEach(node => {
            const depth = node.depth || 0;
            depthCounts[depth] = (depthCounts[depth] || 0) + 1;
        });
        
        const maxDepth = Math.max(...Object.keys(depthCounts).map(Number), 0);
        const depthInfo = Object.keys(depthCounts)
            .sort((a, b) => Number(a) - Number(b))
            .map(d => `depth ${d}: ${depthCounts[d]}`)
            .join(' | ');
        
        graphInfoDiv.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong>States explored:</strong> ${visitedStates.size} | 
                <strong>Transitions:</strong> ${transformationGraph.links.length} | 
                <strong>Max depth:</strong> ${maxDepth}
            </div>
            <div style="font-size: 11px; color: #636e72;">
                ${depthInfo}
            </div>
        `;
    }
}

function getStateHash(nodes, links) {
    const nodeNameMap = new Map();
    nodes.forEach(n => nodeNameMap.set(n.id, n.name));
    
    const edgeStrings = links.map(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const sourceName = nodeNameMap.get(sourceId);
        const targetName = nodeNameMap.get(targetId);
        const minName = sourceName < targetName ? sourceName : targetName;
        const maxName = sourceName < targetName ? targetName : sourceName;
        return `${minName}-${maxName}:${link.col}`;
    }).sort().join('|');
    return edgeStrings;
}

function cloneGraphState() {
    return {
        nodes: JSON.parse(JSON.stringify(json.nodes)),
        links: JSON.parse(JSON.stringify(json.links))
    };
}

function restoreGraphState(state) {
    json.nodes = JSON.parse(JSON.stringify(state.nodes));
    json.links = JSON.parse(JSON.stringify(state.links));
    
    edges = [];
    json.links.forEach(function(e) { 
        var sourceNode = json.nodes.find(function(n) { return n.id === e.source; });
        var targetNode = json.nodes.find(function(n) { return n.id === e.target; });
        if (sourceNode && targetNode) {
            edges.push({source: sourceNode, target: targetNode, col: e.col});
        }
    });
    
    nextNodeId = (json.nodes.length > 0) ? Math.max(...json.nodes.map(n => n.id)) + 1 : 1;
}

function getAllValidTransformations() {
    const transformations = [];
    const colorPairs = [
        ['red', 'blue'],
        ['red', 'green'],
        ['blue', 'green']
    ];
    
    colorPairs.forEach(([color1, color2]) => {
        const cycles = findAlternatingCycles(json.nodes, edges, color1, color2);
        cycles.forEach(cycle => {
            transformations.push({ cycle, color1, color2 });
        });
    });
    
    return transformations;
}

function applyTransformationToState(state, transformation) {
    restoreGraphState(state);
    
    const { cycle, color1, color2 } = transformation;
    
    for (let i = 0; i < cycle.length; i++) {
        const currentNode = cycle[i];
        const nextNode = cycle[(i + 1) % cycle.length];
        
        const edge = edges.find(e => 
            (e.source.id === currentNode.id && e.target.id === nextNode.id) ||
            (e.source.id === nextNode.id && e.target.id === currentNode.id)
        );
        
        if (edge) {
            const oldColor = edge.col;
            const newColor = (oldColor === color1) ? color2 : color1;
            edge.col = newColor;
            
            const jsonLink = json.links.find(l => 
                (l.source === edge.source.id && l.target === edge.target.id) ||
                (l.source === edge.target.id && l.target === edge.source.id)
            );
            if (jsonLink) {
                jsonLink.col = newColor;
            }
        }
    }
    
    return cloneGraphState();
}

async function startDFS() {
    if (dfsRunning) {
        alert('DFS is already running');
        return;
    }
    
    dfsRunning = true;
    dfsStopRequested = false;
    
    document.getElementById('dfsBtn').disabled = true;
    document.getElementById('stopDfsBtn').disabled = false;
    document.getElementById('dfsInfo').style.display = 'block';
    
    visitedStates.clear();
    transformationGraph = { nodes: [], links: [] };
    stateIdCounter = 0;
    
    const initialState = cloneGraphState();
    const initialHash = getStateHash(initialState.nodes, initialState.links);
    
    const initialStateNode = {
        id: stateIdCounter++,
        hash: initialHash,
        state: initialState,
        depth: 0
    };
    
    visitedStates.set(initialHash, initialStateNode);
    transformationGraph.nodes.push(initialStateNode);
    
    updateDFSInfo(1, 0, 0);
    
    await dfsExplore(initialStateNode);
    
    restoreGraphState(initialState);
    redrawGraph();
    recalculateAllCycles();
    updateSelectionInfo();
    updateDebugInfo();
    
    if (!dfsStopRequested) {
        updateDFSInfo(visitedStates.size, transformationGraph.links.length, 'Complete');
    }
    
    dfsRunning = false;
    document.getElementById('dfsBtn').disabled = false;
    document.getElementById('stopDfsBtn').disabled = true;
}

function stopDFS() {
    dfsStopRequested = true;
    updateDFSInfo(visitedStates.size, transformationGraph.links.length, 'Stopped');
}

async function dfsExplore(stateNode) {
    if (dfsStopRequested) return;
    
    restoreGraphState(stateNode.state);
    redrawGraph();
    recalculateAllCycles();
    
    const transformations = getAllValidTransformations();
    
    for (const transformation of transformations) {
        if (dfsStopRequested) break;
        
        const savedState = cloneGraphState();
        const newState = applyTransformationToState(stateNode.state, transformation);
        
        if (!newState) {
            restoreGraphState(savedState);
            continue;
        }
        
        const newHash = getStateHash(newState.nodes, newState.links);
        
        if (!visitedStates.has(newHash)) {
            const newStateNode = {
                id: stateIdCounter++,
                hash: newHash,
                state: newState,
                depth: stateNode.depth + 1
            };
            
            visitedStates.set(newHash, newStateNode);
            transformationGraph.nodes.push(newStateNode);
            
            const cycleDesc = transformation.cycle.map(n => n.name).join('→');
            const transformationEdge = {
                source: stateNode,
                target: newStateNode,
                transformation: {
                    cycle: cycleDesc,
                    colors: `${transformation.color1}/${transformation.color2}`
                }
            };
            transformationGraph.links.push(transformationEdge);
            
            updateDFSInfo(visitedStates.size, transformationGraph.links.length, stateNode.depth + 1);
            
            await sleep(5);
            
            await dfsExplore(newStateNode);
        } else {
            const existingStateNode = visitedStates.get(newHash);
            const alreadyHasEdge = transformationGraph.links.some(link => 
                (link.source.id === stateNode.id && link.target.id === existingStateNode.id) ||
                (link.source.id === existingStateNode.id && link.target.id === stateNode.id)
            );
            
            if (!alreadyHasEdge) {
                const cycleDesc = transformation.cycle.map(n => n.name).join('→');
                const transformationEdge = {
                    source: stateNode,
                    target: existingStateNode,
                    transformation: {
                        cycle: cycleDesc,
                        colors: `${transformation.color1}/${transformation.color2}`
                    }
                };
                transformationGraph.links.push(transformationEdge);
            }
        }
        
        restoreGraphState(savedState);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateDFSInfo(statesExplored, edgesFound, currentDepth) {
    const infoDiv = document.getElementById('dfsInfo');
    const graphInfoDiv = document.getElementById('transformationGraphInfo');
    
    if (infoDiv) {
        if (typeof currentDepth === 'string') {
            infoDiv.textContent = `DFS Status: ${currentDepth} | States: ${statesExplored} | Edges: ${edgesFound}`;
        } else {
            infoDiv.textContent = `DFS Status: Running (depth ${currentDepth}) | States: ${statesExplored}`;
        }
    }
    
    if (graphInfoDiv) {
        graphInfoDiv.textContent = `States explored: ${statesExplored} | Edges: ${edgesFound}`;
    }
}

function redrawTransformationGraph() {
    // Disabled rendering for performance - just keep the data structure
    // The statistics are still updated via updateTransformationGraphInfo()
    return;
}

function renderTransformationGraph() {
    const renderDiv = document.getElementById('transformationGraphRender');
    if (!renderDiv) return;
    
    if (transformationGraph.nodes.length === 0) {
        renderDiv.innerHTML = '<p style="color: #636e72; font-style: italic; padding: 10px;">No transformation graph data to render.</p>';
        return;
    }
    
    // Clear the container
    renderDiv.innerHTML = '';
    
    // Create SVG for the transformation graph
    const containerWidth = renderDiv.clientWidth;
    const containerHeight = renderDiv.clientHeight;
    
    const tgSvg = d3.select('#transformationGraphRender')
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);
    
    // Create a copy of the graph data for D3 force layout
    const graphData = {
        nodes: transformationGraph.nodes.map(n => ({
            id: n.id,
            hash: n.hash,
            depth: n.depth,
            state: n.state
        })),
        links: transformationGraph.links.map(l => ({
            source: l.source.id,
            target: l.target.id,
            transformation: l.transformation
        }))
    };
    
    // Create force layout
    const force = d3.layout.force()
        .nodes(graphData.nodes)
        .links(graphData.links)
        .size([containerWidth, containerHeight])
        .linkDistance(80)
        .charge(-300)
        .gravity(0.05)
        .start();
    
    // Draw links
    const tgLinks = tgSvg.selectAll('.tg-link')
        .data(graphData.links)
        .enter().append('line')
        .attr('class', 'tg-link')
        .style('stroke', '#95a5a6')
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.6);
    
    // Draw nodes
    const tgNodes = tgSvg.selectAll('.tg-node')
        .data(graphData.nodes)
        .enter().append('g')
        .attr('class', 'tg-node')
        .call(force.drag);
    
    tgNodes.append('circle')
        .attr('r', 6)
        .style('fill', function(d) {
            // Color by depth
            const depthColors = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
            return depthColors[d.depth % depthColors.length];
        })
        .style('stroke', '#2c3e50')
        .style('stroke-width', 1.5);
    
    tgNodes.append('text')
        .attr('dx', 10)
        .attr('dy', 4)
        .style('font-size', '10px')
        .style('fill', '#2c3e50')
        .text(function(d) { return 'S' + d.id; });
    
    // Add tooltips on hover
    tgNodes.append('title')
        .text(function(d) {
            return `State ${d.id}\nDepth: ${d.depth}\nHash: ${d.hash.substring(0, 40)}...`;
        });
    
    // Update positions on each tick
    force.on('tick', function() {
        tgLinks
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });
        
        tgNodes.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    });
}

function clearTransformationGraphRender() {
    const renderDiv = document.getElementById('transformationGraphRender');
    if (!renderDiv) return;
    renderDiv.innerHTML = '';
}

