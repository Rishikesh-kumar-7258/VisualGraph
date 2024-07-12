// ######## Variables ###########
var edgeColor = "black";
var edgeWidth = 2;
var directed = false;
var nodeRadius = 25;
var nodeColor = "white";
var nodeStroke = "black";
var nodeStrokeWidth = 2;
var fontSize = 24;
var fontColor = "black";

// ################ Node Class ####################
class Node {
	constructor(val) {
		this.val = val;
		this.pos = {
			x: 300,
			y: 200,
		};
	}

	// getters
	getPos() {
		return this.pos;
	}
	getVal() {
		return this.val;
	}

	// setters
	setPos(pos) {
		this.pos = pos;
	}

	// methods
	render() {
		var node = $(createSVG("circle"));
		node.attr("cx", this.pos.x);
		node.attr("cy", this.pos.y);
		node.attr("r", nodeRadius);
		node.attr("fill", nodeColor);
		node.attr("stroke", nodeStroke);
		node.attr("stroke-width", nodeStrokeWidth);
		node.attr("id", "node" + this.val);

		var text = $(createSVG("text"));
		text.attr("font-size", fontSize);
		text.attr("x", this.pos.x);
		text.attr("y", this.pos.y + fontSize / 3);
		text.attr("fill", fontColor);
		text.attr("text-anchor", "middle");
		text.text(this.val);

		var group = $(createSVG("g"));
		group.append(node);
		group.append(text);

		$("#graph").append(group);
	}

	update() {
		let node = $("#node" + this.val)[0];
		let text = node.nextSibling;

		node.setAttribute("cx", this.pos.x);
		node.setAttribute("cy", this.pos.y);
		text.setAttribute("x", this.pos.x);
		text.setAttribute("y", this.pos.y + fontSize / 3);
	}
}

// ################## Edge Class ####################
class Edge {
	constructor(node1, node2) {
		this.node1 = node1;
		this.node2 = node2;
		this.directed = false;
	}

	// methods
	render() {
		let edge = $(createSVG("line"));
		edge.attr("x1", this.node1.getPos().x);
		edge.attr("y1", this.node1.getPos().y);
		edge.attr("x2", this.node2.getPos().x);
		edge.attr("y2", this.node2.getPos().y);
		edge.attr("stroke", edgeColor);
		edge.attr("stroke-width", edgeWidth);
		edge.attr("id", "edge" + this.node1.getVal() + this.node2.getVal());

		$("#graph").append(edge);
	}

	update() {
		let edge = $("#edge" + this.node1.getVal() + this.node2.getVal())[0];
		this.node1 = graph.getNode(this.node1.getVal());
		this.node2 = graph.getNode(this.node2.getVal());

		edge.setAttribute("x1", this.node1.getPos().x);
		edge.setAttribute("y1", this.node1.getPos().y);
		edge.setAttribute("x2", this.node2.getPos().x);
		edge.setAttribute("y2", this.node2.getPos().y);
	}
}

// ################## Graph Class ####################
class Graph {
	constructor() {
		this.nodes = new Set();
		this.edges = new Set();
		this.adjList = {};
		this.valToNode = {};
	}

	// getters
	getEdges() {
		return this.edges;
	}

	getNodes() {
		return this.nodes;
	}

	getAdjList() {
		return this.adjList;
	}

	// method
	getNode(val) {
		return this.valToNode[val];
	}

	addNode(val) {
		let node = new Node(val);

		if (this.adjList[node.getVal()] === undefined) {
			this.adjList[node.getVal()] = [];
			this.nodes.add(node);

			this.valToNode[val] = node;
		}

		return node;
	}

	addEdge(node1, node2) {
		let edge = new Edge(node1, node2);
		this.edges.add(edge);

		this.adjList[node1.getVal()] = [
			...(this.adjList[node1.getVal()] || []),
			node2.getVal(),
		];

		if (directed === false) {
			this.adjList[node2.getVal()] = [
				...(this.adjList[node2.getVal()] || []),
				node1.getVal(),
			];
		}

		return edge;
	}

	render() {
		this.nodes.forEach((node) => node.render());
		this.edges.forEach((edge) => edge.render());
	}

	update() {
		this.nodes.forEach((node) => node.update());
		this.edges.forEach((edge) => edge.update());
	}

	reset() {
		this.nodes = new Set();
		this.edges = new Set();
		this.adjList = {};
		this.valToNode = {};
	}
}

let graph = new Graph();

// ################ Invoking create graph function on input data #################
$("#edgeInput").on("input", function () {
	resetData();
	createGraph();
});

// ################# Getting graph from input ##################
function getGraph() {
	var edges = $("#edgeInput").val();

	// Splitting the input
	edges = edges.split("\n");
	edges = edges.map((edge) => edge.trim().split(" "));
	edges = edges.filter(
		(edge) => edge.length === 2 && edge[0] !== "" && edge[1] !== ""
	);

	edges.map((edge) => {
		node1 = graph.addNode(edge[0]);
		node2 = graph.addNode(edge[1]);
		addedEdge = graph.addEdge(node1, node2);
	});
}

// ################### Creating graph ##################
function createGraph() {
	getGraph();
	graph.render();
	dfs(graph.getAdjList());
}

// ################# Resetting data #################
function resetData() {
	$("#graph")[0].innerHTML = "\n";
	graph.reset();
}

// ################# Creating SVG elements ###################
function createSVG(tagName) {
	return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

// ################# Making SVG Draggable ###################
document.addEventListener("DOMContentLoaded", function () {
	let svg = document.querySelector("svg");
	makeDraggable(svg);
});

function makeDraggable(e) {
	let svg = e;
	svg.addEventListener("mousedown", startDrag);
	svg.addEventListener("mousemove", drag);
	svg.addEventListener("mouseup", endDrag);
	svg.addEventListener("mouseleave", endDrag);

	let selectedNode, elementOffset, cursorOffset;

	function startDrag(e) {
		if (e.target.tagName === "circle") {
			selectedNode = graph.getNode(e.target.nextSibling.innerHTML);

			elementOffset = selectedNode.getPos();

			cursorOffset = {
				x: e.clientX,
				y: e.clientY,
			};
		}
	}

	function drag(e) {
		if (selectedNode) {
			e.preventDefault();

			let deltaPos = {
				x: e.clientX - cursorOffset.x,
				y: e.clientY - cursorOffset.y,
			};

			selectedNode.setPos({
				x: elementOffset.x + deltaPos.x,
				y: elementOffset.y + deltaPos.y,
			});

			graph.update();
		}
	}

	function endDrag(e) {
		selectedNode = null;
	}
}

// ##################### Algorithms ######################
// DFS algorithm
function dfs(adjList) {
	visited = {};
	parent = {};

	startPos = {
		x: parseFloat($("#graph")[0].width.baseVal.value / 2),
		y: 100,
	};

	for (let node in adjList) {
		if (visited[node] === undefined) {
			nodeList = [];
			posList = [];
			nodeList.push(node);
			posList.push(structuredClone(startPos));
			startPos.x += 3 * nodeRadius;

			while (nodeList.length > 0) {
				topNode = nodeList.pop();
				topPos = posList.pop();

				visited[topNode] = true;

				nodeObj = graph.getNode(topNode);
				nodeObj.pos = structuredClone(topPos);
				topPos.y += 3 * nodeRadius;

				graph.update();

				adjList[topNode].forEach((nbr) => {
					if (visited[nbr] === undefined) {
						nodeList.push(nbr);
						posList.push(structuredClone(topPos));
						topPos.x += 3 * nodeRadius;
					}
				});
			}
		}
	}
}
