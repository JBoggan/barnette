var width = 960,
    height = 700

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var swap = [];

var json = {
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
  ]}

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
var nextNodeId = 9; // Start after existing nodes
var previousState = null;

document.addEventListener('DOMContentLoaded', (event) => {
    // Automatically calculate and display all three cycle types when the page loads
    displayTwoColorAlternatingCycles('red', 'blue', 'redBlueCycles');
    displayTwoColorAlternatingCycles('red', 'green', 'redGreenCycles');
    displayTwoColorAlternatingCycles('blue', 'green', 'blueGreenCycles');
    
    // Add transform button event listener
    const transformBtn = document.getElementById('transformBtn');
    if (transformBtn) {
        transformBtn.addEventListener('click', performTransformation);
    }

    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', undoTransformation);
    }
    
    // Initialize debug info
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

function updateSelectionInfo() {
    const infoDiv = document.getElementById('selectionInfo');
    if (selectedEdges.length === 0) {
        infoDiv.textContent = "Select up to 2 edges to transform";
    } else if (selectedEdges.length === 1) {
        const edge = selectedEdges[0];
        infoDiv.textContent = `Selected: ${edge.source.name}-${edge.target.name}`;
    } else {
        const edge1 = selectedEdges[0];
        const edge2 = selectedEdges[1];
        infoDiv.textContent = `Selected: ${edge1.source.name}-${edge1.target.name}, ${edge2.source.name}-${edge2.target.name}`;
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

function getNextNodeName() {
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

    // Generate the next 4 names by incrementing the max number
    const nextNames = [];
    for (let i = 1; i <= 4; i++) {
        nextNames.push(numberToName(maxNum + i));
    }

    return nextNames;
}

function performTransformation() {
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
    
    // Remove the selected edges from the edges array
    const edge1Index = edges.indexOf(edge1);
    if (edge1Index > -1) edges.splice(edge1Index, 1);
    const edge2Index = edges.indexOf(edge2);
    if (edge2Index > -1) edges.splice(edge2Index, 1);
    
    // Debug: Log what we're trying to remove
    console.log("Selected edges to remove:");
    console.log("Edge1:", edge1.source.name + "-" + edge1.target.name, "Color:", edge1.col);
    console.log("Edge2:", edge2.source.name + "-" + edge2.target.name, "Color:", edge2.col);
    
    console.log("Current json.links before removal:");
    json.links.forEach((link, index) => {
        const sourceNode = json.nodes.find(n => n.id === link.source);
        const targetNode = json.nodes.find(n => n.id === link.target);
        console.log(`Link ${index}: ${sourceNode.name}-${targetNode.name}, Color: ${link.col}`);
    });
    
    // Remove the exact selected edges from json.links
    // We need to find the exact links that correspond to our selected edges
    const link1Index = json.links.findIndex(l => {
        // Check if this link corresponds to edge1
        const sourceNode = json.nodes.find(n => n.id === l.source);
        const targetNode = json.nodes.find(n => n.id === l.target);
        const matches = (sourceNode === edge1.source && targetNode === edge1.target) ||
                       (sourceNode === edge1.target && targetNode === edge1.source);
        if (matches) {
            console.log("Found edge1 match at index", json.links.indexOf(l), ":", sourceNode.name + "-" + targetNode.name, "Color:", l.col);
        }
        return matches;
    });
    
    const link2Index = json.links.findIndex(l => {
        // Check if this link corresponds to edge2
        const sourceNode = json.nodes.find(n => n.id === l.source);
        const targetNode = json.nodes.find(n => n.id === l.target);
        const matches = (sourceNode === edge2.source && targetNode === edge2.target) ||
                       (sourceNode === edge2.target && targetNode === edge2.source);
        if (matches) {
            console.log("Found edge2 match at index", json.links.indexOf(l), ":", sourceNode.name + "-" + targetNode.name, "Color:", l.col);
        }
        return matches;
    });
    
    console.log("Removing links at indices:", link1Index, link2Index);
    
    if (link1Index > -1) {
        const removedLink = json.links[link1Index];
        const sourceNode = json.nodes.find(n => n.id === removedLink.source);
        const targetNode = json.nodes.find(n => n.id === removedLink.target);
        console.log("Removed link1:", sourceNode.name + "-" + targetNode.name, "Color:", removedLink.col);
        json.links.splice(link1Index, 1);
    }
    if (link2Index > -1) {
        const removedLink = json.links[link2Index];
        const sourceNode = json.nodes.find(n => n.id === removedLink.source);
        const targetNode = json.nodes.find(n => n.id === removedLink.target);
        console.log("Removed link2:", sourceNode.name + "-" + targetNode.name, "Color:", removedLink.col);
        json.links.splice(link2Index, 1);
    }
    
    console.log("json.links after removal:");
    json.links.forEach((link, index) => {
        const sourceNode = json.nodes.find(n => n.id === link.source);
        const targetNode = json.nodes.find(n => n.id === link.target);
        console.log(`Link ${index}: ${sourceNode.name}-${targetNode.name}, Color: ${link.col}`);
    });
    
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
    
    // Recalculate all cycles
    recalculateAllCycles();
    
    // Enable the undo button
    document.getElementById('undoBtn').disabled = false;
}

function undoTransformation() {
    if (!previousState) {
        console.warn("No previous state to undo to.");
        return;
    }

    // Restore the graph data from the saved state
    json.nodes = previousState.nodes;
    json.links = previousState.links;
    
    // The `edges` array also needs to be rebuilt from the restored json.links
    edges = [];
    json.links.forEach(function(e) { 
        var sourceNode = json.nodes.find(function(n) { return n.id === e.source; });
        var targetNode = json.nodes.find(function(n) { return n.id === e.target; });
        if (sourceNode && targetNode) {
            edges.push({source: sourceNode, target: targetNode, col: e.col});
        }
    });

    // Clear the stored state so undo can only be used once
    previousState = null;
    
    // Disable the undo button as it has just been used
    document.getElementById('undoBtn').disabled = true;

    // Clear any active selection and reset visual state
    selectedEdges = [];
    link.style("stroke-width", 3).style("filter", "none");
    updateSelectionInfo();

    // Redraw the graph with the restored data
    redrawGraph();
    recalculateAllCycles();
    updateDebugInfo();
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
    // Find all edges that belong to this cycle
    const cycleEdges = [];
    
    for (let i = 0; i < cycle.length; i++) {
        const currentNode = cycle[i];
        const nextNode = cycle[(i + 1) % cycle.length]; // Wrap around to first node
        
        // Find the edge connecting these two nodes
        const edge = edges.find(e => 
            (e.source.id === currentNode.id && e.target.id === nextNode.id) ||
            (e.source.id === nextNode.id && e.target.id === currentNode.id)
        );
        
        if (edge) {
            cycleEdges.push(edge);
        }
    }
    
    // Swap colors for all edges in the cycle
    cycleEdges.forEach(edge => {
        if (edge.col === color1) {
            edge.col = color2;
        } else if (edge.col === color2) {
            edge.col = color1;
        }
    });
    
    // Update the visual display
    link.style("stroke", function(d) {
        return d.col;
    });
    
    // Recalculate all three cycle types after the color swap
    recalculateAllCycles();
}

function recalculateAllCycles() {
    // Recalculate and display cycles for all three color combinations
    displayTwoColorAlternatingCycles('red', 'blue', 'redBlueCycles');
    displayTwoColorAlternatingCycles('red', 'green', 'redGreenCycles');
    displayTwoColorAlternatingCycles('blue', 'green', 'blueGreenCycles');
}

