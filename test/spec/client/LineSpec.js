define(['main'], function() {
	describe('Line', function() {
		var container;

		beforeEach(function() {
			setFixtures(sandbox());

			container = new NodeDashboard({width: 1000, height:1000});
			$('#sandbox').append(container.element);
		});

		it('create basic line container in one position', function() {
			
			var line = new Line(container, {x: 30, y: 40});

			expect(line.position.x).toBe(30);
			expect(line.position.y).toBe(40);
			expect(line.container).not.toBe(null);

			expect(line.dimension.width).toBe(1000);

		});

		it('add one node to the line', function() {
			var line = new Line(container, {x: 30, y: 40});

			line.addNode();

			expect(line.nodes.length).toBe(1);
		});


		it('add new first node should position it in center', function() {
			var line = new Line(container, {x: 0, y:0});
			line.addNode();

			var newNode = line.nodes[0];
			expect(newNode.position.x).toBe(500);
		});

		it('add second node should reposition first', function() {
			var line = new Line(container, {x: 0, y:0});

			line.addNode();
			var firstNode = line.nodes[0];

			line.addNode();
			var secondNode = line.nodes[1];

			expect(firstNode.position.x).toBeCloseTo(333.33, 2);
			expect(secondNode.position.x).toBeCloseTo(666.67, 2);
		});

		it('should link nodes from 2 different line containers', function() {
			var line = new Line(container, {x: 0, y:0});		

			var secondContainer = new NodeDashboard({width: 1000, height:1000});
			$('#sandbox').append(secondContainer.element);

			var secondLine = new Line(secondContainer, {x: 0, y:0});

			line.addNode().linkWith(secondLine.addNode());
			
			expect(line.nodes[0].position.x).toBe(500);
			expect(secondLine.nodes[0].position.x).toBe(500);

			expect(line.nodes[0].fromLinks[0]).toEqual(secondLine.nodes[0].toLinks[0]);
		});

	});
});