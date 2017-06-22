class Graph
=begin
Notes:

=end



	def nodes 
	 	@nodes
	end

	def edges
		@edges
	end


	def incrementNode
		@max_node.next!
	end


	def node?(name)
		self.nodes.include?(name)
	end

	def edge?(name)
		self.edges.include?(name)
	end



	def initialize(adjacency)
		@max_node = ""
		@nodes = {}
		@edges = processEdges(adjacency)
	end

	def processEdges(adjacency)
		edges = {}
		adjacency.each do |e|
			edge = Edge.new(e)
			edges[edge.name] = edge
			e.each do |n|
				if node?(n)	
					node = self.nodes[n]
					node.add_adj_edge(e)
					adj_edges = node.edges
					adj_edges.map{|x| edge.add_adj_edge(x); edges[x].add_adj_edge(edge.name)}
				else
					@max_node = n if n.length > @max_node.length || n > @max_node
					node = Node.new(n)
					node.add_adj_edge(e)
					@nodes[node.name] = node
				end
			end
		end
		return edges
	end

	def nodesFromCycle(name)
		node_array = name.split("_").slice(0..-2)
	end

	def orientEdge(edge)
		if self.edge?(edge)
			return edge
		elsif self.edge?(reverseEdgeName(edge))
			return reverseEdgeName(edge)
		else
			raise "Not an edge!"
		end
	end

	def orientCycleEdges(name)
		edge_array = name.split("_")
		puts edge_array.to_s
		count = edge_array.count - 1
		unordered_edges = (0..count).map{|t| "#{edge_array[t]}_#{edge_array[t+1]}"}
		unordered_edges.pop
		puts unordered_edges.to_s
		unordered_edges.map{|e| orientEdge(e)}
	end

	def reverseEdgeName(name)
		array = name.split("_")
		return array[1]+"_"+array[0]
	end


	

	def dropEdge(edge)
		#drop edge from graph
		#drop adjacency from two nodes
		#drop adjacency from all edges
		#drop node adjacency from two nodes
		nodes = edge.split('_')
		nodes.map{|n| self.nodes[n].drop_edge(edge)}
		self.nodes[nodes[0]].drop_node(nodes[1])
        self.nodes[nodes[1]].drop_node(nodes[0])
		self.edges[edge].adj_edges.map{|e| self.edges[e].drop_edge(edge)}
		self.edges.delete(edge)
	end

	

	

	def make_directed_hash(edge_array)
		hash = {}
		edge_array.map{|e| e.split("_")}.map{|array| hash[array[0]] = array[1]}
		return hash
	end

	def cycle_from_directed_hash(hash)
		max = hash.keys.count
		current = hash.keys.first
		start = current
		last = ""
		cycle = current
		current = hash[current]
		count = 1
		until last == first || count > max
			cycle += ("_" + current)
			current = hash[current]
			count += 1
		end
		return cycle
	end

end

class Example
	def self.cube_edges
		[["a","b"],
		["b","c"],
		["c","d"],
		["d","a"],
		["e","f"],
		["f","g"],
		["g","h"],
		["h","e"],
		["a","e"],
		["b","f"],
		["c","g"],
		["d","h"]
		]
	end

	def self.octo_edges
		[["a","b"], ["b","c"], ["c","d"], ["d","e"],
		["e","f"], ["f","g"], ["g","h"], ["h","a"],
		["i","j"], ["j","k"], ["k","l"], ["l","m"],
		["m","n"], ["n","o"], ["o","p"], ["p","i"],
		["a","p"], ["b","o"], ["c","n"], ["d","m"],
		["e","l"], ["f","k"], ["g","j"], ["h","i"]
		]

	end

	def self.hex_edges
		[["a","b"], ["b","c"], ["c","d"], ["d","e"], ["e","f"], ["f","a"],
		["g","h"], ["h","i"], ["i","j"], ["j","k"], ["k","l"], ["l","g"],
		["a","l"], ["b","k"], ["c","j"], ["d","i"], ["e","h"], ["f","g"]
		]
	end

	def self.hetfo_edges
		[["a","b"], ["b","c"], ["c","d"], ["d","e"], ["e","f"], ["f","g"],
		["g","h"], ["h","i"], ["i","j"], ["j","a"], ["a","k"], ["k","l"],
		["k","al"], ["l","m"], ["l","am"], ["m","o"], ["m","n"], ["o","p"],
		["o","q"], ["n","j"], ["n","p"], ["p","r"], ["q","r"], ["q","an"],
		["r","s"], ["i","s"], ["s","t"], ["t","u"], ["t","ao"], ["u","v"],
		["u","ar"], ["v","h"], ["v","w"], ["w","g"], ["w","x"], ["x","y"],
		["x","f"], ["y","z"], ["y","ar"], ["z","aa"], ["z","aq"], ["aa","ap"],
		["aa","ab"], ["ab","ac"], ["ab","ak"], ["ac","ad"], ["ac","aj"], ["ad","ae"],
		["ad","ai"], ["ae","af"], ["ae","e"], ["af","d"], ["af","ag"], ["ag","c"],
		["ag","ah"], ["ah","b"], ["ah","ai"], ["ai","aj"], ["aj","ak"], ["ak","al"],
		["al","am"], ["am","an"], ["an","ao"], ["ao","ap"], ["ap","aq"], ["aq","ar"]
		  ]
	end
end

class Node
	def initialize(node_name)
		@name = node_name.to_s
		@adj_nodes = []
		@adj_edges = []
	end

	def name
		@name
	end

	def add_adj_edge(edge_array)
		@adj_edges << "#{edge_array[0]}_#{edge_array[1]}"
		other_node = edge_array.select{|e| e != @name}[0]
		self.add_adj_node(other_node)
	end

	def drop_edge(old_edge)
		@adj_edges.delete(old_edge)
	end

	def add_adj_node(node_name)
		@adj_nodes << node_name
	end

	def drop_node(disconnected_node)
		@adj_nodes.delete(disconnected_node)
	end


	def edges
		@adj_edges
	end

end

class Edge
	def initialize(edge_array)
		@name = "#{edge_array[0]}_#{edge_array[1]}"
		@adj_nodes = [edge_array[0].to_s, edge_array[1].to_s]
		@adj_edges = []
		@color = nil
		#check to see if adj nodes have non-self edges
		#if so add adjacent edge
	end

	def set_color(color)
		@color = color
	end

	def color
		@color
	end

	def add_adj_edge(new_edge)
		@adj_edges << new_edge if new_edge != name
	end

	def drop_edge(old_edge)
		@adj_edges.delete(old_edge)
	end


	def name
		@name
	end

	def adj_edges
		@adj_edges
	end

	def nodes
		@adj_nodes
	end


end

	


