class BarnetteGraph
=begin
Notes:

Faces must be defined by the user since this is computationally very difficult to work out.
As a convention that will simplify merging and division, all faces are labeled in clockwise orientation

For building a map of all colorings:

Nodes are the .hash of the coloring itself. edges are bidirected and labeled by their swapped cycle

A reverse hash lookup for the colorings would be handy

Consider removing specific h-cycle code since we have gone and modeled something much more general

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

	def color_edges(coloring)
		coloring.keys.map{|e| edges[e].set_color(coloring[e])}
	end

	def current_edge_coloring
		coloring = {}
		edges.keys.map{|e| coloring[e] = edges[e].color}
		return coloring
	end

	def overall_valid_edge_coloring?
		nodes.keys.map{|n| valid_edge_coloring?(nodes[n])}.reduce(:&)
	end

	def valid_edge_coloring?(node)
		local = node.edges.map{|e| edges[e]}
		{"red" => 1, "blue" => 1, "green" => 1} == {local[0].color => 1, local[1].color => 1, local[2].color => 1}
	end

	def swap_color_cycle(cycle)
		color_a, color_b = [edges[cycle[0]].color, edges[cycle[1]].color]
		cycle.map{|e| swap_edge_color(e, color_a, color_b)}
	end

	def factor_counts
		self.induced_two_factors.map{|k,v| {k => v.count}}
	end

	def factor_sizes
		self.induced_two_factors.map{|k,v| {k => v.map{|c| c.count}}}
	end

	def hamiltonian_coloring?
		self.factor_counts.map{|h| h[:redblue] == 1 || h[:redgreen] == 1 || h[:bluegreen] == 1}.reduce(:|)
	end

	def random_recolor
		twocolor = [:redblue, :redgreen, :bluegreen][rand 3]
		cycles = self.induced_two_factors[twocolor]
		cycle = cycles[rand cycles.count]
		self.swap_color_cycle(cycle) 
	end

	def induced_cycle(edge_a, edge_b)
		color_a = edge_a.color
		color_b = edge_b.color
		colors = [color_a, color_b]
		cycle = [edge_a, edge_b]
		current_edge = edges[edge_b.adj_edges.select{|e| colors.include?(edges[e].color) && !cycle.include?(edges[e])}[0]]
		while current_edge != nil	
			cycle << current_edge
			current_edge = edges[current_edge.adj_edges.select{|e| colors.include?(edges[e].color) && !cycle.include?(edges[e])}[0]]
		end
		return cycle
	end

	def swap_edge_color(edge_name, color_a, color_b)
		edge = edges[edge_name]
		case edge.color
		when color_a
			edge.set_color(color_b)
		when color_b
			edge.set_color(color_a)
		end
	end

	def map_edge_colorings
		color_hash = {}
		color_hash[current_edge_coloring.hash.to_s] = {coloring: current_edge_coloring, }
		current_edge_coloring
	end

	def induced_two_factors
		two_factors = {redblue: [], redgreen: [], bluegreen: []}
		coloring = current_edge_coloring
		redblue_edges = coloring.keys.select{|x| coloring[x] != "green"}
		redgreen_edges = coloring.keys.select{|x| coloring[x] != "blue"}
		bluegreen_edges = coloring.keys.select{|x| coloring[x] != "red"}
		two_factors[:redblue] = determine_cycles(redblue_edges)
		two_factors[:redgreen] = determine_cycles(redgreen_edges)
		two_factors[:bluegreen] = determine_cycles(bluegreen_edges)
		return two_factors
	end

	def determine_cycles(two_factor)
		cycled_edges = []
		while !two_factor.empty?
			edge_a = edges[two_factor[0]]
			edge_b = edges[edge_a.adj_edges.select{|adj| two_factor.include?(adj)}.first]
			cycle = induced_cycle(edge_a, edge_b).map{|e| e.name}
			cycled_edges << cycle
			cycle.map{|e| two_factor.delete(e)}
		end
		return cycled_edges
	end



	def incrementNode
		@max_node.next!
	end

    def nextFourNodes
		x = [@max_node]
		x[1] = x[0].next
		x[2] = x[1].next
		x[3] = x[2].next
		return x
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



	def initialize(adjacency, face_array, coloring)
		@max_node = ""
		@nodes = {}
		@edges = processEdges(adjacency)
		@faces = processFaces(face_array)
		self.color_edges(coloring)
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

	def sameOrientation?(edge_a, edge_b, face)
        face.include?(edge_a) == face.include?(edge_b)
	end

	def algorithmUp(edge_a, edge_b)
		# just make it return a new Graph instead of getting messy in modifying node/face/edge/color relations
		# so we just need a new adjacency list, new face listing, and a new coloring
		
        adj_list = this.edges.keys
        face_list = this.faces.keys
        coloring = this.current_edge_coloring

		a = self.edges[edge_a]
		b = self.edges[edge_b]
        
        face = self.faces[(a.faces & b.faces)[0]]

        a1, a4 = a.nodes
        b1, b4 = b.nodes
		
		a2, a3, b2, b3 = nextFourNodes
        
        adj_list.delete(edge_a)
        adj_list.delete(edge_b)

        adj_list.push(a1+'_'+a2)
        adj_list.push(a2+'_'+a3)
        adj_list.push(a3+'_'+a4)
        adj_list.push(b1+'_'+b2)
        adj_list.push(b2+'_'+b3)
        adj_list.push(b3+'_'+b4)
        if (sameOrientation?(edge_a, edge_b, face.name))
        	adj_list.push(a2+'_'+b3)
        	adj_list.push(a3+'_'+a2) ##???
        	face_list.push(a2+'_'+a3+'_'+b2+'_'+b3+'_'+a2)

        else
			adj_list.push(a2+'_'+b2)
        	adj_list.push(a3+'_'+a3)
        	face_list.push(a2+'_'+a3+'_'+b3+'_'+b2+'_'+a2)

        end

        ##adj_list good to go
        ##face list is a little harder
 
        ## find faces with edge_a and edge_b and expand them
        
        ###no do this for the other face
        oriented_a = face.includes?(edge_a) ? edge_a : self.reverseEdgeName(edge_a)
        oriented_b = face.includes?(edge_b) ? edge_b : self.reverseEdgeName(edge_b)


        face_list.select{|f| f.includes?(oriented_a)}.map{|f| f.sub(oriented_a, a1+'_'+a2+'_'+a3+'_'+a4)}
        face_list.select{|f| f.includes?(oriented_b)}.map{|f| f.sub(oriented_b, b1+'_'+b2+'_'+b3+'_'+b4)}

        

        #cut face with both in two after expansion
        

        big_face = face_list.select{|f| f.includes?(edge_a) && f.includes?(edge_b)}[0]
        face_list.remove(big_face)
        



        
        
        
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

	def self.cube_coloring
		{"a_b"=>"red", "b_c"=>"blue", "c_d"=>"red", "d_a"=>"blue", "e_f"=>"red", "f_g"=>"blue", "g_h"=>"red", "h_e"=>"blue", 
			"a_e"=>"green", "b_f"=>"green", "c_g"=>"green", "d_h"=>"green"}
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
		'a_b_k_l_a', 'b_c_j_k_b', 'c_d_i_j_c', 'd_e_h_i_d', 'e_f_g_h_e', 'f_a_l_g_f'
		]
	end

	def self.hex_hcycles
		['a_b_c_d_e_f_g_h_i_j_k_l_a', 'a_b_c_d_e_h_i_j_k_l_g_f_a', 'd_c_b_a_f_e_h_g_l_k_j_i_d', 
		'c_b_a_f_e_d_i_h_g_l_k_j_c', 'b_a_f_e_d_c_j_i_h_g_l_k_b', 'a_f_e_d_c_b_k_j_i_h_g_l_a', 
		'a_b_k_j_c_d_i_h_e_f_g_l_a', 'a_l_k_b_c_j_i_d_e_h_g_f_a'
		]
	end

	def self.hex_coloring

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

	def self.hetfo_faces
		['a_b_c_d_e_f_g_h_i_j_a', 'a_b_ah_ai_aj_ak_al_k_a', 'k_al_am_l_k', 'l_am_an_q_o_m_l', 'a_k_l_m_n_j_a',
			'm_o_p_n_m', 'o_q_r_p_o', 'q_an_ao_t_s_r_q', 'ao_ap_aq_ar_u_t_ao', 'u_v_w_x_y_ar_u',
			'j_n_p_r_s_i_j', 'i_s_t_u_v_h_i', 'h_v_w_g_h', 'g_w_x_f_g', 'f_x_y_z_aa_ab_ac_ad_ae_e_f',
			'af_d_e_ae_af', 'ag_c_d_af_ag', 'ah_b_c_ag_ah', 'aq_z_y_ar_aq', 'ap_aa_z_aq_ap',
			'an_am_al_ak_ab_aa_ap_ao_an', 'ak_aj_ac_ab_ak', 'aj_ai_ad_ac_aj', 'ai_ah_ag_af_ae_ad_ai'
		]
	end



	def self.hetfo_coloring
		{"a_b" => "red", "b_c" => "blue", "c_d" => "red", "d_e" => "blue", "e_f" => "red", "f_g" => "blue", "g_h" => "red", 
			"h_i" => "blue", "i_j" => "red", "j_a" => "blue", 
			"a_k" => "green", "k_l" => "red", "k_al" => "blue", "l_m" => "green", "l_am" => "blue", "m_o" => "blue",
			"m_n" => "red", "o_p" => "green", "o_q" => "red", "n_j" => "green", "n_p" => "blue", "p_r" => "red", "q_r" => "green", 
			"q_an" => "blue", "r_s" => "blue", "i_s" => "green", "s_t" => "red", "t_u" => "green", "t_ao" => "blue", "u_v" => "red", 
			"u_ar" => "blue", "v_h" => "green", "v_w" => "blue", "w_g" => "green", "w_x" => "red", "x_y" => "blue", "x_f" => "green", 
			"y_z" => "green", "y_ar" => "red", "z_aa" => "blue", "z_aq" => "red", "aa_ap" => "green", "aa_ab" => "red", "ab_ac" => "green",
			"ab_ak" => "blue", "ac_ad" => "red", "ac_aj" => "blue", "ad_ae" => "blue", "ad_ai" => "green", "ae_af" => "red", "ae_e" => "green",
			"af_d" => "green", "af_ag" => "blue", "ag_c" => "green", "ag_ah" => "red", "ah_b" => "green", "ah_ai" => "blue", "ai_aj" => "red", 
			"aj_ak" => "green", "ak_al" => "red", "al_am" => "green", "am_an" => "red", "an_ao" => "green", "ao_ap" => "red", "ap_aq" => "blue", "aq_ar" => "green"}
	end

	def self.hetfo_hamiltonian_coloring
		{"a_b"=>"green", "b_c"=>"blue", "c_d"=>"green", "d_e"=>"red", "e_f"=>"green", "f_g"=>"red", "g_h"=>"green", "h_i"=>"blue", 
			"i_j"=>"green", "j_a"=>"red", "a_k"=>"blue", "k_l"=>"red", "k_al"=>"green", "l_m"=>"blue", "l_am"=>"green", "m_o"=>"red", 
			"m_n"=>"green", "o_p"=>"green", "o_q"=>"blue", "n_j"=>"blue", "n_p"=>"red", "p_r"=>"blue", "q_r"=>"red", "q_an"=>"green", 
			"r_s"=>"green", "i_s"=>"red", "s_t"=>"blue", "t_u"=>"red", "t_ao"=>"green", "u_v"=>"blue", "u_ar"=>"green", "v_h"=>"red", 
			"v_w"=>"green", "w_g"=>"blue", "w_x"=>"red", "x_y"=>"green", "x_f"=>"blue", "y_z"=>"red", "y_ar"=>"blue", "z_aa"=>"green", 
			"z_aq"=>"blue", "aa_ap"=>"red", "aa_ab"=>"blue", "ab_ac"=>"green", "ab_ak"=>"red", "ac_ad"=>"red", "ac_aj"=>"blue", 
			"ad_ae"=>"green", "ad_ai"=>"blue", "ae_af"=>"red", "ae_e"=>"blue", "af_d"=>"blue", "af_ag"=>"green", "ag_c"=>"red", 
			"ag_ah"=>"blue", "ah_b"=>"red", "ah_ai"=>"green", "ai_aj"=>"red", "aj_ak"=>"green", "ak_al"=>"blue", "al_am"=>"red", 
			"am_an"=>"blue", "an_ao"=>"red", "ao_ap"=>"blue", "ap_aq"=>"green", "aq_ar"=>"red"} 
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
		@color = nil
		#check to see if adj nodes have non-self edges
		#if so add adjacent edge
	end

	def set_color(color)
		@color = color if ['red','blue','green'].include?(color)
	end

	def color
		@color
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

