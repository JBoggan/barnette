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

