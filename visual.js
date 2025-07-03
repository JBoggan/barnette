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
      "group": 0
    },
    {
      "id": 2,
      "name": "b",
      "group": 2
    },
    {
      "id": 3,
      "name": "c",
      "group": 0
    },
    {
      "id": 4,
      "name": "d",
      "group": 0
    },
    {
      "id": 5,
      "name": "e",
      "group": 1
    },
    {
      "id": 6,
      "name": "f",
      "group": 0
    },
    {
      "id": 7,
      "name": "g",
      "group": 0
    },
    {
      "id": 8,
      "name": "h",
      "group": 1
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

var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height]);
var drag = force.drag()
    .on("dragstart", dragstart);

  force
      .nodes(json.nodes)
      .links(edges)
      .start();

  var link = svg.selectAll("link")
      .data(edges)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke", function(d) {
        return d.col;
       });
      //.on("click", clickCycle);



  //.append("circle").attr("r", 5)
  var node = svg.selectAll("node")
      .data(json.nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("fill", function(d) {
        //return d3.select('input[name="dataset"]:checked').node().value;
        return fill(d.group);
       }).on("dblclick", dblclick)
      .call(force.drag);;;

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


  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      
      labels.attr("x", function(d) { return (d.source.x + d.target.x + 10) / 2; }) 
        .attr("y", function(d) { return (d.source.y + d.target.y+ 10) / 2; }) 

    // Edge crossing prevention
    var repulsionStrength = 0.5; // Adjust as needed
    for (var i = 0; i < edges.length; i++) {
        for (var j = i + 1; j < edges.length; j++) {
            var edge1 = edges[i];
            var edge2 = edges[j];

            // Ensure edges don't share a common node
            if (edge1.source === edge2.source || edge1.source === edge2.target ||
                edge1.target === edge2.source || edge1.target === edge2.target) {
                continue;
            }

            if (segmentsIntersect(edge1.source, edge1.target, edge2.source, edge2.target)) {
                // Apply a simple repulsive force
                // Push edge1's nodes away from edge2's nodes and vice-versa
                // This is a very basic approach and might need refinement

                var dx = edge2.source.x - edge1.source.x;
                var dy = edge2.source.y - edge1.source.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) dist = 0.0000001; // prevent division by zero
                var forceX = (dx / dist) * repulsionStrength;
                var forceY = (dy / dist) * repulsionStrength;

                // Apply force to edge1's source and target away from edge2's source
                if (!edge1.source.fixed) {
                    edge1.source.x -= forceX;
                    edge1.source.y -= forceY;
                }
                if (!edge1.target.fixed) {
                    edge1.target.x -= forceX;
                    edge1.target.y -= forceY;
                }

                // Apply force to edge2's source and target away from edge1's source
                if (!edge2.source.fixed) {
                    edge2.source.x += forceX;
                    edge2.source.y += forceY;
                }
                 if (!edge2.target.fixed) {
                    edge2.target.x += forceX;
                    edge2.target.y += forceY;
                }
            }
        }
    }
      
  });







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

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
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

document.addEventListener('DOMContentLoaded', (event) => {
    const findRedBlueBtn = document.getElementById('findRedBlueBtn');
    const findRedGreenBtn = document.getElementById('findRedGreenBtn');
    const findBlueGreenBtn = document.getElementById('findBlueGreenBtn');
    
    if (findRedBlueBtn) {
        findRedBlueBtn.addEventListener('click', () => {
            displayTwoColorAlternatingCycles('red', 'blue', 'redBlueCycles'); 
        });
    }
    
    if (findRedGreenBtn) {
        findRedGreenBtn.addEventListener('click', () => {
            displayTwoColorAlternatingCycles('red', 'green', 'redGreenCycles'); 
        });
    }
    
    if (findBlueGreenBtn) {
        findBlueGreenBtn.addEventListener('click', () => {
            displayTwoColorAlternatingCycles('blue', 'green', 'blueGreenCycles'); 
        });
    }
});

function displayTwoColorAlternatingCycles(color1, color2, containerId) {
    const containerDiv = document.getElementById(containerId);
    if (!containerDiv) return;

    // Clear previous results but keep the header and button
    const header = containerDiv.querySelector('h3');
    const findButton = containerDiv.querySelector('button');
    containerDiv.innerHTML = '';
    if (header) containerDiv.appendChild(header);
    if (findButton) containerDiv.appendChild(findButton);

    const cycles = findAlternatingCycles(json.nodes, edges, color1, color2);

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
        
        const edgeSignature = [currentNode.id, neighborNode.id].sort().join('-');
        //if (visitedEdges.has(edgeSignature)) continue; // Avoid re-traversing the same edge in the same path immediately

        if (neighborNode.id === targetNode.id) { // Cycle detected
            if (currentPath.length > 1) { // Ensure cycle has at least 2 edges
                 // Path must be even length to correctly alternate back to start node with the 'otherColor'
                if (currentPath.length % 2 === 0) { 
                    foundCycles.push([...currentPath]);
                }
            }
            // Continue search for longer cycles, don't stop here
        }

        // If neighbor is not already in the current path (avoid trivial cycles on same edge back and forth)
        if (!currentPath.find(pathNode => pathNode.id === neighborNode.id)) {
            currentPath.push(neighborNode);
            //visitedEdges.add(edgeSignature);
            dfsFindCycles(neighborNode, targetNode, currentPath, otherColor, expectedColor, adj, foundCycles, visitedEdges);
            //visitedEdges.delete(edgeSignature);
            currentPath.pop(); // Backtrack
        }
    }
}

function uniqueCycles(cycles) {
    const unique = [];
    const seenSignatures = new Set();

    cycles.forEach(cycle => {
        if (cycle.length === 0) return;
        // Normalize the cycle: find the smallest node ID and rotate the cycle to start with it.
        // Then convert to a string signature.
        let minNodeId = cycle[0].id;
        let minNodeIndex = 0;
        for (let i = 1; i < cycle.length; i++) {
            if (cycle[i].id < minNodeId) {
                minNodeId = cycle[i].id;
                minNodeIndex = i;
            }
        }
        const normalizedCycle = [...cycle.slice(minNodeIndex), ...cycle.slice(0, minNodeIndex)];
        
        // Create two signatures: one for forward, one for reverse to handle A->B->C and C->B->A as same
        const signature1 = normalizedCycle.map(n => n.id).join('-');
        const signature2 = [...normalizedCycle].reverse().map(n => n.id).join('-');

        if (!seenSignatures.has(signature1) && !seenSignatures.has(signature2)) {
            unique.push(normalizedCycle);
            seenSignatures.add(signature1);
            seenSignatures.add(signature2);
        }
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
}

