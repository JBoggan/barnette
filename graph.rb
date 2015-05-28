class BarnetteGraph
=begin
Notes:

Faces must be defined by the user since this is computationally very difficult to work out.
As a convention that will simplify merging and division, all faces are labeled in clockwise orientation

=end



	def nodes 
	 	@nodes
	end

	def edges
		@edges
	end

	def faces
		@faces
	end

	def hcycles
		@hcycles
	end

	def isBipartite?
		0 == self.faces.select{|f| f.nodes.count != 0 % 2}
	end

	def isThreeConnected?

	end

	def incrementNode
		@max_node.next!
	end

	def isHamiltonian?

	end

	def isPlanar?

	end

	def isCubic?
		0 == self.nodes.select{|n| n.edges.count != 3}
	end

	def render
		#for d3.js visualization
	end

	def node?(name)
		self.nodes.include?(name)
	end

	def edge?(name)
		self.edges.include?(name)
	end

	def face?(name)
		self.faces.include?(name)
	end

	def hcycle?(name)
		self.hcycles.include?(name)
	end



	def initialize(adjacency, face_array, hcycles = nil)
		@max_node = ""
		@nodes = {}
		@edges = processEdges(adjacency)
		@faces = processFaces(face_array)
		@hcycles = processHcycles(hcycles)
	end

	def processHcycles(cycle_array)
		hcycles = {}
		cycle_array.each do |h|
			hcycle = Hcycle.new(h)
			
			edges = orientCycleEdges(h)
			edges.each do |e|
				edge = self.edges[e]
				hcycle.add_edge(e)
				@edges[e].add_hcycle(h)
			end
			hcycles[h] = hcycle
		end
		return hcycles
	end

	def processFaces(face_array)
		faces = {}
		face_array.each do |f|
			face = Face.new(f)

			edges = orientCycleEdges(f)
			edges.each do |e|
				edge = self.edges[e]
				if !edge.faces.empty?
					other_face = faces[edge.faces[0]]
					face.add_adj_face(other_face.name)
					other_face.add_adj_face(face.name)
					faces[other_face.name] = other_face
				end
				face.add_adj_edge(e)
				@edges[e].add_face(f)

			end

			nodes = nodesFromCycle(f)
			nodes.each do |n|
				face.add_node(n)
				@nodes[n].add_face(f)
			end
			faces[f] = face
		end
		return faces
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

	def algorithmUp(edge_array)
		#edge_array.map{|e| segmentEdge(e)}
		#connectSegments
	end

	def algorithmDown(edge_array)
		return nil if edge_array.count != 2
		edge_array.map{|e| dropEdge(e)}
		#desegment	
		#
	end

	def dropEdge(edge)
		edge.split('_').map{|n| self.nodes[n].drop_edge(edge)}
		self.edges[edge].adj_edges.map{|e| self.edges[e].drop_edge(edge)}
		#mergeFaces(edge)
		#transformHamiltonian(edge)
	end

	def mergeFaces(edge)
		faces = @edges[edge].faces
		face1 = faces[0]
		face2 = faces[1]
		
		sum_edges = face1.edges + face2.edges
		sum_rad_edges = face1.radiating_edges + face2.radiating_edges
		sum_nodes = face1.nodes + face2.nodes
		sum_faces = face1.adj_faces + face2.adj_faces

		sum_rad_edges.select!{|e| !face1.edges.include?(e) && !face2.edges.include?(e)}
		sum_nodes.uniq!
		sum_faces.select!{|f| face1.name != f && face2.name != f}.uniq!

		sum_name = mergeFaceName(edge)

		self.drop_face(face1)
		self.drop_face(face2)
		new_face = Face.new(sum_name)
		new_face


	end

	def mergeFaceName(edge)
		faces = @edges[edge].faces
		face1 = faces[0]
		face2 = faces[1]

		edges = face1.name.split(edge) + face2.name.split(edge)
		edges - [edge]
		directed_hash = make_directed_hash(edges)
		new_name = cycle_from_directed_hash(directed_hash)
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

	def segmentEdge(edge)

	end

	def desegment

	end

	def connectSegments

	end

	def newAlgoEdges

	end

	def newAlgoFaces

	end

	def findSquare
		self.faces.keys.each do |f|
			return f if f.length == 9
		end
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

	def self.cube_faces
		['a_b_c_d_a', 'e_f_g_h_e', 'a_b_f_e_a', 'b_c_g_f_b', 'c_d_h_g_c', 'a_e_h_d_a']
	end

	def self.cube_hcycles
		['a_b_c_d_h_g_f_e_a','b_c_d_a_e_h_g_f_b', 'c_d_a_b_f_e_h_g_c', 'd_a_b_c_g_f_e_h_d', 'a_e_f_b_c_g_h_d_a', 'b_f_g_c_d_h_e_a_b']
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

	def self.octo_faces
		['a_b_c_d_e_f_g_h_a', 'i_j_k_l_m_n_o_p_i',
		'a_b_o_p_a', 'b_c_n_o_b', 'c_d_m_n_c', 'd_e_l_m_d',
		'e_f_k_l_e', 'f_g_j_k_f', 'g_h_i_j_g', 'h_a_p_i_h']
	end

	def self.octo_hcycles
		['a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',
		'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_a',			
		]
	end

	def self.hex_edges
		[["a","b"], ["b","c"], ["c","d"], ["d","e"], ["e","f"], ["f","a"],
		["g","h"], ["h","i"], ["i","j"], ["j","k"], ["k","l"], ["l","g"],
		["a","l"], ["b","k"], ["c","j"], ["d","i"], ["e","h"], ["f","g"]
		]
	end

	def self.hex_faces
		['a_b_c_d_e_f_a', 'g_h_i_j_k_l_g',
		'a_b_k_l_a', 'b_c_j_k_b', 'c_d_i_j_c', 'd_e_h_i_d', 'e_f_g_h_e', 'f_a_l_j_f'
		]
	end

	def self.hex_hcycles
		['a_b_c_d_e_f_g_h_i_j_k_l_a', 'a_b_c_d_e_h_i_j_k_l_g_f_a', 'd_c_b_a_f_e_h_g_l_k_j_i_d', 
		'c_b_a_f_e_d_i_h_g_l_k_j_c', 'b_a_f_e_d_c_j_i_h_g_l_k_b', 'a_f_e_d_c_b_k_j_i_h_g_l_a', 
		'a_b_k_j_c_d_i_h_e_f_j_l_a', 'a_l_k_b_c_j_i_d_e_h_g_f_a'
		]
	end



end

class Node
	def initialize(node_name)
		@name = node_name.to_s
		@adj_nodes = []
		@adj_faces = []
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

	def edges
		@adj_edges
	end

	def add_face(face)
		@adj_faces << face
	end

end

class Edge
	def initialize(edge_array)
		@name = "#{edge_array[0]}_#{edge_array[1]}"
		@adj_nodes = [edge_array[0].to_s, edge_array[1].to_s]
		@adj_faces = []
		@adj_edges = []
		@hcycles = []
		#check to see if adj nodes have non-self edges
		#if so add adjacent edge
	end

	def add_hcycle(hcycle)
		@hcycles << hcycle
	end

	def add_adj_edge(new_edge)
		@adj_edges << new_edge if new_edge != name
	end

	def drop_edge(old_edge)
		@adj_edges.delete(old_edge)
	end

	def add_face(face)
		@adj_faces << face
	end

	def hcycles
		@hcycles
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

	def faces
		@adj_faces
	end

end

class Face
	def initialize(name)
		@name = name
		@adj_edges = []
		@radiating_edges = []
		@adj_nodes = []
		@adj_faces = []
	end

	def add_adj_face(face)
		@adj_faces << face
	end

	def add_node(node)
		@adj_nodes << node
	end

	def add_adj_edge(edge)
		@adj_edges << edge
	end

	def add_radiating_edge(edge)
		@radiating_edges << edge
	end

	def edges
		@adj_edges
	end

	def radiating_edges
		@radiating_edges
	end

	def nodes
		@adj_nodes
	end

	def adj_faces
		@adj_faces
	end

	def name
		@name
	end
end

class Hcycle
	def initialize(name)
		@name = name
		@edges = []
	end

	def add_edge(edge)
		@edges << edge
	end

	def edges
		@edges
	end

end

