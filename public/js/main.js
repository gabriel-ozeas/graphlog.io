
var propsMap = {
	nodeSizeWidth: 100,
	nodeSizeHeight: 100,
	totalLineNodes: 5
};

$(document).ready(function() {
	var actualId  = 0;

	var dashboard = {
		lines: [],
		element: $('#dashboard'),

		addNode: function(props) {
			if (_.isEmpty(this.lines)) {
				this.lines.push(new Line());
				this.element.append(_.last(this.lines).element);
			}

			if (_.size(_.last(this.lines).nodes) < propsMap.totalLineNodes) {
				_.last(this.lines).addNode();
			} else {
				var oldLastLine = _.last(this.lines);

				this.lines.push(new Line());
				this.element.append(_.last(this.lines).element);

				_.last(this.lines).addNode().linkWith(_.last(oldLastLine.nodes));
			}
		},

		
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

function Line() {
	return  {
		nodes: [],
		orientation: 'right',

		element: $('<div></div>').addClass('dashboard-line'),

		init: function() {
			return this;
		},

		addNode: function() {
			var newTotalOfNodes = this.nodes.length + 1;

			var nodeHorizontalDistance = this.calculateNodesXDistance(newTotalOfNodes);
			this.repositionNodes(nodeHorizontalDistance); 

			var nodePositionX = (nodeHorizontalDistance * this.nodes.length) + nodeHorizontalDistance;

			var nodePosition = {x: nodePositionX, y: 10};

			var newNode = new Node(nodePosition, {id: 'node-' + newTotalOfNodes});
			
			this.nodes.push(newNode);
			this.element.append(newNode.element);

			var that = this;

			setTimeout(function() {
				newNode.element.removeClass('preactive').addClass('active');	
				newNode.display = true;

				if (newTotalOfNodes > 1) {
					var fromNode = that.nodes[newTotalOfNodes - 2];
					var toNode = that.nodes[newTotalOfNodes - 1];

					var link = fromNode.linkWith(toNode);
					that.element.append(link.element);
				}
			}, 100);

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
				var position = {x: x, y: node.position.y};
				node.move(position);
				x += distance;
			});
		},

		calculateNodesXDistance: function(numberOfNodes) {
			return (this.element.width() / (numberOfNodes + 1)) - (propsMap.nodeSizeWidth / 2);
		}
	}.init();
}


function Node(position, props) {
	return {
		id: '',
		name: '',
		fromLinks: [],
		toLinks: [],
		displayed: false,
		
		element: $('<div><div/>').addClass('node').addClass('preactive'),

		position: {},

		init: function(position, props) {
			if (props !== undefined) {
				if (props.id !== undefined) {
					this.id = props.id;
					this.element.attr('id', this.id);
				}
			}
			this.position = position;
			this.element.css({
				'position': 'absolute',
				'top': this.position.y + 'px',
				'left': this.position.x + 'px'
			});

			return this;
		},

		move: function(position) {
			this.position = position;

			$(this.element).css('left', this.position.x + 'px');

			_.each(this.toLinks, function(link) {
				link.move();
			});
		},

		linkWith: function(node) {
			var link = new Link(this, node);

			this.fromLinks.push(link);
			node.toLinks.push(link);

			return link;
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
		}
	}.init(position, props);
}

function Link(from, to) {
	return {
		fromNode: null,
		toNode: null,

		element: $('<span></span>').addClass('horizontal-link-line'),

		position: {},
		
		init: function(from, to) {
			this.fromNode = from;
			this.toNode = to;

			this.position.x = this.fromNode.position.x + (this.fromNode.element.width() / 2);
			this.position.y = this.fromNode.position.y + (this.fromNode.element.height() / 2);

			this.element.css({
				'position': 'absolute',
				'top': this.position.y + 'px',
				'left': this.position.x + 'px',
				'width': (this.toNode.position.x - this.fromNode.position.x - (this.toNode.element.width() / 2)) + 'px',
				'z-index': '-1'
			});

			return this;
		},

		move: function() {
			this.element.css({
				'left': (this.fromNode.position.x + (this.fromNode.element.width() / 2)) + 'px',
				'width': (this.toNode.position.x - this.fromNode.position.x) + 'px',
			});
		},
		remove: function() {
			this.element.remove();
		}
	}.init(from, to);
}
