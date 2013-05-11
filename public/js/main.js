
var NODE_SIZE_WIDTH = 100;
var NODE_SIZE_HEIGHT = 100;
var INLINE_CONTAINER_TOTAL_NODES = 5;
var LINE_HEIGHT = 200;


$(document).ready(function() {
	var actualId  = 0;

	var dashboard = {
		lines: [],
		element: $('#dashboard'),

		addNode: function(props) {
			// add line container if there's no one.
			var line = (_.isEmpty(this.lines)) ? this.createInLineContainer({x:0, y:0}) : _.last(this.lines);
			
			// adding to the same line until the max of nodes
			if (!(line.isFull())) {

				if (_.isEmpty(line.nodes)) {
					line.addNode();
				} else {
					var lastNode = _.last(line.nodes);
					line.addNodeAfter(lastNode);
				}

			// if line is full of nodes, create another
			} else {
				var lastLine = line;
				
				positionY = lastLine.position.y + LINE_HEIGHT;

				line = this.createInLineContainer({x: 0, y: positionY});
				line.addNodeAfter(_.last(lastLine.nodes));
			}
		},

		createInLineContainer: function(position) {
			var line = new Line(this, position);
			this.lines.push(line);
			this.element.append(_.last(this.lines).element);
			return line;
		}
	};

	$('#add-log-node').click(function() {
		dashboard.addNode({
			id: actualId,
			name: actualId
		});
		actualId++;
		return false;
	});

	$('#remove-log-node').click(function() {
		var node = _.last(dashboard.nodes);
		dashboard.removeNode(node);
	});
});

function Line(container, position, props) {
	return  {
		configs: {		
			/**
			 * 1 indicates the nodes to be added from left to right. Otherwise, -1 do the inverse.
			 * @type {Number}
			 */
			orientation: 1,

			/**
			 * Maximum number of nodes in same line container.
			 * @type {Number}
			 */
			maximumOfNodes: 5,
		},

		nodes: [],
		element: $('<div></div>').addClass('dashboard-line'),

		position: {x: 0, y:0},
		dimension: {width: 0, height: 0},

		init: function(container, position, props) {
			$.extend(this.config, props);

			this.container = container;
			this.position = position;

			return this;
		},

		/**
		 * Link this node after another node, even though the previuous node is in another line.
		 * @param {Node} node The previous node where this will be added.
		 */
		addNodeAfter: function(node) {
			var link = this.addNode().linkWith(node);
		},

		addNode: function() {
			var newTotalOfNodes = this.nodes.length + 1;

			var nodeHorizontalDistance = this.calculateNodesXDistance(newTotalOfNodes);
			this.repositionNodes(nodeHorizontalDistance); 

			var nodePositionX = (nodeHorizontalDistance * this.nodes.length) + nodeHorizontalDistance;

			var nodePosition = {x: nodePositionX + (NODE_SIZE_WIDTH / 2), y: 60};

			var newNode = new Node('node-' + newTotalOfNodes, this, nodePosition);
			
			this.nodes.push(newNode);
			this.element.append(newNode.element);

			newNode.element.addClass('animated').addClass('bounceIn');	
			setTimeout(function() {
				newNode.element.removeClass('bounceIn').removeClass('animated');	
				newNode.display = true;
			}, 400);

			return newNode;
		},

		removeNode: function(node) {
			var nodeIndex = _.indexOf(this.nodes, node);
			var removedNode = this.nodes.pop(nodeIndex);
			removedNode.remove();

			var distance = this.calculateNodesXDistance(_.size(this.nodes));
			this.repositionNodes(distance);
		},

		repositionNodes: function(distance) {
			if (this.nodes.length == 0) return;
			
			var x = distance;

			_.each(this.nodes, function(node) {
				var position = {x: x, y: node.position.y};
				node.move(position);
				x += distance;
			});
		},

		calculateNodesXDistance: function(numberOfNodes) {
			return (this.element.width() / (numberOfNodes + 1)) - (NODE_SIZE_WIDTH / (numberOfNodes + 1));
		},

		isFull: function() {
			return _.size(this.nodes) >= this.configs.maximumOfNodes;
		},

		getPosition: function() {
			return {x: this.element.offset().left, y: this.element.offset().top};
		},
	}.init(container, position, props);
}


/**
 * Represents a node element in the interface. 
 * @param {Line} container The container where the Node will be added.
 * @param {Position} position The position relative to the container where the node will be added.
 * @param {Object} configs Another properties that can be configured can be passed.
 */
function Node(id, container, position, configs) {
	this.id = id;
	this.fromLinks = [];
	this.toLinks = [];

	this.dimension = {
		width: Node.DEFAULT_WIDTH, 
		height: Node.DEFAULT_HEIGHT
	}

	if (configs !== undefined) {
		$.extend(this.configs, configs);
	}

	this.container = container;
	this.position = position;

	var x = this.position.x - (this.dimension.width / 2);
	var y = this.position.y - (this.dimension.height / 2);

	this.element = $('<div><div/>').addClass('node');
	this.element.css({
		'position': 'absolute',
		'top': y + 'px',
		'left': x+ 'px'
	}).width(this.dimension.width + "px").height(this.dimension.height + "px");

	return this;
}

/**
 * Default width size in pixels for a node.
 * @type {Number}
 */
Node.DEFAULT_WIDTH = 100;

/**
 * Default height size in pixels for a node.
 * @type {Number}
 */
Node.DEFAULT_HEIGHT = 100;

Node.prototype = {
	constructor: Node,

	/**
	 * Move a node, specifying the position where the node will be inside its container. 
	 * When moving, it is considered as translation origin the component center. 
	 * 
	 * @param  {Position}   position Point in container limits where the node will be moved.
	 * @param  {Function} callback A callback function called when the node was moved.
	 */
	move: function(position, callback) {
		this.position = position;

		var x = this.position.x;
		var y = this.position.y - (this.dimension.height / 2);

		$(this.element).css('left', x + 'px');
		$(this.element).css('top', y + 'px');

		var nodePosition = { x: x, y: y};

		_.each(this.toLinks, function(link) {
			var toPosition = {
				x: link.toNode.position.x + (link.toNode.element.width() / 2),
				y: link.toNode.position.y + (link.toNode.element.height() / 2)
			};
			link.updateLinkPosition();
		});

		_.each(this.fromLinks, function(link) {
			var fromPosition = {
				x: link.fromNode.position.x + (link.fromNode.element.width() / 2),
				y: link.fromNode.position.y + (link.fromNode.element.height() / 2)
			};
			link.updateLinkPosition();
		});

		if (callback) {
			callback(position);	
		}
	},

	/**
	 * Create a link between this node and the node passed as parameter.
	 * This node will be the start point to the link.
	 * 
	 * @param  {Node} node Node where the link will end.
	 * @return {Link}      Link between the nodes
	 */
	linkWith: function(node) {
		var link = new Link(node, this, this.container);

		this.fromLinks.push(link);
		node.toLinks.push(link);

		return link;
	},

	/**
	 * Indicates if this node and the parameter Node are from the same container.
	 * 
	 * @param  {Node}  node Node that will be compared
	 * @return {Boolean}    True indicates that the two nodes is from the same container. Otherwise return False.
	 */
	isFromSameContainer: function(node) {
		return this.container === node.container;
	},

	remove: function() {
		this.element.remove();

		_.each(this.fromLinks, function(link) {
			link.remove();
		});
		this.fromLinks.length = 0;

		_.each(this.toLinks, function(link) {
			link.remove();
		});
		this.toLinks.length = 0;
	},

	toString: function() {
		return "[Node id=" + this.id + ", container=" + this.container + ", position=" + this.position + "]";
	},

	/**
	 * Compare if two nodes are equals, see the id.
	 * @param  {[type]} Node Node to be compared
	 * @return {[type]}      True indicates that the nodes ar equals. Otherwise return False.
	 */
	equals: function(node) {
		if (!(node instanceof Node)) {
			return false;
		}

		return (this.id === node.id)
	}
};

/**
 * View component that link nodes.
 * 
 * @param {Node} from Node where the link will start from.
 * @param {Node} to Node where the link will end.
 */
function Link(from, to) {
	this.fromNode = from;
	this.toNode = to;

	this.element = $('<span></span>').addClass('horizontal-link-line');

	if (this.fromNode.position.x <= this.toNode.position.x) {
		this.container = this.fromNode.container;	
	} else {
		this.container = this.toNode.container;
	}
	
	this.updateLinkPosition();

	this.element.addClass('animated').addClass('fadeIn');
	that = this;
	setTimeout(function() {
		that.element.removeClass('fadeIn').removeClass('animated');
	}, 200);

	this.container.element.append(this.element);

	return this;
}

Link.prototype = {
	constructor: Link,

	/**
	 * Update the link based on related node positions. 
	 */
	updateLinkPosition: function() {
		if (this.fromNode.position.x <= this.toNode.position.x) {
			this.startPoint = { x: this.fromNode.position.x, y: this.fromNode.position.y};
			this.endPoint = {x: this.toNode.position.x, y: this.toNode.position.y};
		} else {
			this.startPoint = {x: this.toNode.position.x, y: this.toNode.position.y};
			this.endPoint = { x: this.fromNode.position.x, y: this.fromNode.position.y};
		}

		var distanceX = Math.abs(this.endPoint.x - this.startPoint.x);
		var distanceY = Math.abs(this.endPoint.y - this.startPoint.y);

		if (!(this.fromNode.isFromSameContainer(this.toNode))) {
			distanceY += Math.abs(this.fromNode.container.position.y - this.toNode.container.position.y);
		}

		this.dimension = {
			width: Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)), 
			height: 0
		};

		this.angle = - ((Math.atan2(distanceY, distanceX)) * 180 / Math.PI);

		this.element.css({
			'position': 'absolute',
			'top': this.startPoint.y + 'px',
			'left': this.startPoint.x + 'px',
			'width': this.dimension.width + 'px',
			'-webkit-transform-origin': '0% 0%',
			'-moz-transform-origin': '0% 0%',
			'transform-origin': '0% 0%',
			'-moz-transform': 'rotate(' + this.angle + 'deg)',
			'-webkit-transform': 'rotate(' + this.angle + 'deg)',
			'-moz-transform': 'rotate(' + this.angle + 'deg)',
			'z-index': '-1'
		});
	},

	remove: function() {
		this.element.remove();
	},

	equals: function(link) {
		if (!(link instanceof Link)) {
			return false;
		}

		return true;
	}
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype = {
	toString: function() {
		return '[x: ' + this.x + ', y: ' + this. y + ']';
	},
	equals: function(point) {
		if (!(point instanceof Point)) {
			return false;
		}

		if (this.x === node.x && this.y === node.y) {
			return true;
		} else {
			return false;
		}
	}
}



