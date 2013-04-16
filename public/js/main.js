$(document).ready(function() {
	var dashboard = $('#dashboard'),
		actualId  = 0;

	$('#add-log-node').click(function() {
		addLogNode({
			id: actualId,
			name: actualId
		});
		actualId++;
		return false;
	});

	function addLogNode(nodeProperties) {
		var newNode = $('<div><div/>').addClass('node').addClass('preactive');

		if (nodeProperties.id !== undefined) {
			newNode.attr('data-node-id', nodeProperties.id);
		}

		var totalNodes = getAllNodes().length;
		var newTotalOfNodes = totalNodes + 1;

		var nodeHorizontalDistance = (dashboard.width() / (newTotalOfNodes + 1)) - (newNode.width() / 2);
		
		repositionNodesInDashboard(nodeHorizontalDistance); 

		var newNodePosition = (nodeHorizontalDistance * totalNodes) + nodeHorizontalDistance;

		newNode.css({
			'position': 'absolute',
			'top': '20px',
			'left': newNodePosition + 'px' // add it to final position 
		});
		dashboard.append(newNode);

		setTimeout(function() {
			newNode.removeClass('preactive').addClass('active');	
			if (newTotalOfNodes > 1) {
				addNodeLink(getAllNodes()[newTotalOfNodes - 2], getAllNodes()[newTotalOfNodes - 1]);
			}
		}, 100);
	};

	function addNodeLink(firstNode, secondNode, horizontal) {
		console.log($(secondNode).offset().left);
		var newLink = $('<span></span>').addClass('horizontal-link-line');
		newLink.css({
			'position': 'absolute',
			'top': ($(firstNode).offset().top - ($(firstNode).height() / 2)) + 'px',
			'left': ($(firstNode).offset().left - ($(firstNode).width() / 2)) + 'px',
			'width': ($(secondNode).offset().left - $(firstNode).offset().left - ($(secondNode).width() / 2)) + 'px',
			'z-index': '-1'
		});
		dashboard.append(newLink);
	}

	function getAllNodes() {
		return $('.node');
	}

	function repositionNodesInDashboard(newNodeHorizontalDistance) {
		if (getAllNodes().length == 0) return;

		var positionX = newNodeHorizontalDistance;
		getAllNodes().each(function() {
			$(this).css('left', positionX + 'px');
			positionX += newNodeHorizontalDistance;
		});
	}
});
