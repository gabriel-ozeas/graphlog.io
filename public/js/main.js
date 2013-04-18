const NODE_SIZE_WIDTH = 100,
	  NODE_SIZE_HEIGHT = 100;

$(document).ready(function() {
	var actualId  = 0;

	var dashboard = {
		nodes: [],
		element: $('#dashboard'),

		addNode: function(props) {
			var totalNodes = this.nodes.length;
			var newTotalOfNodes = totalNodes + 1;

			var nodeHorizontalDistance = this.calculateNodesXDistance(newTotalOfNodes);
			this.repositionNodes(nodeHorizontalDistance); 

			var nodePositionX = (nodeHorizontalDistance * totalNodes) + nodeHorizontalDistance;
			var nodePosition = {x: nodePositionX, y: 20};

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
				var position = {x: x, y: 20};
				node.move(position);
				x += distance;
			});
		},

		calculateNodesXDistance: function(numberOfNodes) {
			return (this.element.width() / (numberOfNodes + 1)) - (NODE_SIZE_WIDTH / 2);
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
		
		init: function() {
			this.fromNode = from;
			this.toNode = to;

			this.element.css({
				'position': 'absolute',
				'top': (this.fromNode.position.y + (this.fromNode.element.height() / 2)) + 'px',
				'left': (this.fromNode.position.x + (this.fromNode.element.width() / 2)) + 'px',
				'width': (this.toNode.position.x - this.fromNode.position.x - (this.toNode.element.width() / 2)) + 'px',
				'z-index': '-1'
			});

			return this;
		},

		move: function() {
			console.log(this.fromNode.position);
			console.log(this.toNode.position);

			this.element.css({
				'left': (this.fromNode.position.x + (this.fromNode.element.width() / 2)) + 'px',
				'width': (this.toNode.position.x - this.fromNode.position.x) + 'px',
			});
		},
		remove: function() {
			this.element.remove();
		}
	}.init();
}
