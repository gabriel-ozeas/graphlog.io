
var NODE_SIZE_WIDTH = 100;
var NODE_SIZE_HEIGHT = 100;
var INLINE_CONTAINER_TOTAL_NODES = 5;
var LINE_HEIGHT = 200;


$(document).ready(function() {
	var actualId  = 0;
	var dashboard = new NodeDashboard($('#dashboard'));

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

function NodeDashboard(containerElement, dimension) {
	this.lines = [];
	this.element = $('<div class="nodeDashboard"></div>');
	this.dimension = {
		width:0, height:0
	};

	containerElement.append(this.element);

	if (dimension !== undefined) {
		this.element.width(dimension.width);
		this.element.height(dimension.height);	
	}

	this.dimension.width = this.element.width();
	this.dimension.height = this.element.height();			
}

NodeDashboard.prototype = {
	addNode: function(props) {
		// add line container if there's no one.
		var line = (_.isEmpty(this.lines)) ? this.createInLineContainer(new Point(0, 0), Line.RIGHT_ORIENTATION) : _.last(this.lines);
		
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
			
			positionY = lastLine.position.y + Line.DEFAULT_HEIGHT;

			if (lastLine.configs.orientation === Line.RIGHT_ORIENTATION) {
				line = this.createInLineContainer(new Point(0, positionY), Line.LEFT_ORIENTATION);	
			} else {
				line = this.createInLineContainer(new Point(0, positionY), Line.RIGHT_ORIENTATION);	
			}
			
			line.addNodeAfter(_.last(lastLine.nodes));
		}
	},

	createInLineContainer: function(position, orientation) {
		var configs = {};
		configs.orientation = orientation;

		var line = new Line(this, position, configs);
		this.addLineContainer(line);
		return line;
	},

	/**
	 * Append line container to this dashboard
	 * @param  {Line} line Append an existing line container to the dashboard
	 */
	addLineContainer: function(line) {
		this.lines.push(line);
		this.element.append(line.element);
	}
};

function Line(container, position, configs) {
	this.configs = {};
	this.configs.orientation = Line.RIGHT_ORIENTATION;
	this.configs.maximumOfNodes = Line.MAXIMUM_OF_NODE;

	$.extend(this.configs, configs);

	this.nodes =  [];
	this.element = $('<div></div>').addClass('dashboard-line');

	this.dimension = {};
	this.dimension.height = Line.DEFAULT_HEIGHT;

	if (container) {
		this.container = container;	
		this.dimension.width = this.container.dimension.width;
		this.container.addLineContainer(this);
	}

	this.position = position ? position : new Point(0,0);
}

/**
 * Indicates tha the line container should add nodes to right by default
 * @type {Number}
 */
Line.RIGHT_ORIENTATION = 1;

/**
 * Indicates tha the line container should add nodes to right by default
 * @type {Number}
 */
Line.LEFT_ORIENTATION = -1;

/**
 * Maximum of nodes that can be added to the line container.
 * @type {Number}
 */
Line.MAXIMUM_OF_NODE = 5;

/**
 * Default height in pixels
 * @type {Number}
 */
Line.DEFAULT_HEIGHT = 200;

Line.prototype = {
	constructor: Line,
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

		var nodePositionX = (nodeHorizontalDistance * this.nodes.length) + nodeHorizontalDistance;;
		if (this.configs.orientation === Line.LEFT_ORIENTATION) {
			nodePositionX = this.dimension.width - nodePositionX;
		} 

		var nodePosition = new Point(nodePositionX, 60);
		var nodeId = 'node-' + newTotalOfNodes;

		var nodeConfigs = {};
		nodeConfigs.priority = Math.floor((Math.random() * Node.MAXIMUM_PRIORITY) + 1);

		var newNode = new Node(nodeId, this, nodePosition, nodeConfigs);
		
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

		var that = this;
		_.each(this.nodes, function(node) {
			var position = new Point(x, node.position.y);

			if (that.configs.orientation === Line.LEFT_ORIENTATION) {
				position.x = that.dimension.width - position.x;
			}
			node.move(position);
			x += distance;
		});
	},

	calculateNodesXDistance: function(numberOfNodes) {
		return (this.element.width() / (numberOfNodes + 1));
	},

	isFull: function() {
		return _.size(this.nodes) >= this.configs.maximumOfNodes;
	},

	getPosition: function() {
		return {x: this.element.offset().left, y: this.element.offset().top};
	},
};

/**
 * Represents a node element in the interface. 
 * @param {Line} container The container where the Node will be added.
 * @param {Position} position The position relative to the container where the node will be added.
 * @param {Object} configs Another properties that can be configured can be passed.
 */
function Node(id, container, position, configs) {
	this.id = id;
	this.name = id;

	this.configs = {
		priority: Node.MAXIMUM_PRIORITY
	};

	if (configs !== undefined) {
		$.extend(this.configs, configs);
	}

	this.fromLinks = [];
	this.toLinks = [];

	this.dimension = {};

	var halfNodeWidth = Node.DEFAULT_WIDTH / 2;
	this.dimension.width = halfNodeWidth + (halfNodeWidth * this.configs.priority) / Node.MAXIMUM_PRIORITY;

	var halfNodeHeight = Node.DEFAULT_HEIGHT / 2;
	this.dimension.height = halfNodeHeight + (halfNodeHeight * this.configs.priority) / Node.MAXIMUM_PRIORITY;

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

	var nameDescription = $('<span></span>').addClass('nodeDescription').html(this.name);
	this.element.append(nameDescription);

	var that = this;
	this.element.click(function() {
		that.awating = (that.awating) ? 1 : - that.awating;
		that.wait();
	});

	return this;
}

/**
 * Default width size in pixels for a node.
 * @type {Number}
 */
Node.DEFAULT_WIDTH = 200;

/**
 * Default height size in pixels for a node.
 * @type {Number}
 */
Node.DEFAULT_HEIGHT = 200;

/**
 * Highiest priority for a node. This is the default when not specifiy one.
 * @type {Number}
 */
Node.MAXIMUM_PRIORITY = 5;

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

		var x = this.position.x - (this.dimension.width / 2);
		var y = this.position.y - (this.dimension.height / 2);

		$(this.element).css('left', x + 'px');
		$(this.element).css('top', y + 'px');

		var nodePosition = { x: x, y: y};

		_.each(this.fromLinks, function(link) {
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

	wait: function() {
		var awaiter = new NodeLoader(this);
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

function NodeLoader(node) {
	this.element = $('<canvas></canvas>')
		.attr('width', node.dimension.width)
		.attr('height', node.dimension.height);

	node.element.append(this.element);

	this.element.click(function(e) {
		e.preventDefault();
		this.remove();
	});

    this.drawLoader();
}

NodeLoader.DEFAULT_ANIMATION_INTERVAL = 800;
NodeLoader.TOTAL_CHART_PIECES = 20;

NodeLoader.prototype = {
	constructor: NodeLoader,

	drawLoader: function() {
		var ctx = this.element.get(0).getContext('2d');
		var center = new Point(this.element.width() / 2, this.element.height() / 2);

		ctx.fillStyle = "rgba(83, 119, 122, 0.5)";

		var totalOfPieces = NodeLoader.TOTAL_CHART_PIECES,
			totalOfPiecesToDisplay = 1;

		var that = this;
		
		var drawVisiblePieces = function drawVisiblePieces(numberOfPiecesToDisplay) {
			ctx.clearRect(0, 0, that.element.width(), that.element.height());

			if (numberOfPiecesToDisplay >= totalOfPieces) {
				return;
			}

			var startAngle = 0;
			var increase = ((1 / totalOfPieces) * 2 * Math.PI);

			for (var i = 1; i <= numberOfPiecesToDisplay; i++) {
				ctx.beginPath();
				ctx.moveTo(center.x, center.y);
				ctx.arc(center.x, center.y, that.element.width() / 2, startAngle, startAngle + increase, false);
				ctx.lineTo(center.x, center.y);
				ctx.fill();

				startAngle = startAngle + increase;
			}
			setTimeout(function() {
				numberOfPiecesToDisplay = numberOfPiecesToDisplay + 1;
				drawVisiblePieces(numberOfPiecesToDisplay);
			},  NodeLoader.DEFAULT_ANIMATION_INTERVAL);
		}

		setTimeout(drawVisiblePieces(totalOfPiecesToDisplay), NodeLoader.DEFAULT_ANIMATION_INTERVAL);
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

	this.inverseLink = this.fromNode.position.x > this.toNode.position.x;

	this.container = (this.inverseLink) ? this.toNode.container : this.fromNode.container;	
	
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
		this.startPoint = { x: this.fromNode.position.x, y: this.fromNode.position.y};
		this.endPoint = {x: this.toNode.position.x, y: this.toNode.position.y};

		if (this.inverseLink) {
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

		this.angle = ((Math.atan2(distanceY, distanceX)) * 180) / Math.PI;

		if (this.container.configs.orientation === Line.LEFT_ORIENTATION && this.inverseLink) {
			this.angle = -this.angle;
		}

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



