define(['main'], function() {
	describe('Node', function() {
		var line;

		beforeEach(function() {
			line = new Line(null, {x: 0, y:0});
		});

		it('create a new node position in center', function() {
			node = new Node('node-one', line, {x: 20, y:30});

			expect(node.container).toBe(line);
			expect(node.position.x).toBe(20);
			expect(node.position.y).toBe(30);
		});

		it('linking two nodes should save links', function() {
			nodeOne = new Node('node-one', line, {x: 20, y:30});
			nodeTwo = new Node('node-two', line, {x: 40, y:50});

			nodeOne.linkWith(nodeTwo);

			expect(nodeOne.fromLinks.length).toBe(1);
			expect(nodeOne.toLinks.length).toBe(0);

			expect(nodeTwo.toLinks.length).toBe(1);
			expect(nodeTwo.fromLinks.length).toBe(0);
		});

		it('moving node should change the its position', function() {
			node = new Node('node-one', line, {x: 20, y:30});

			expect(node.position.x).toBe(20);
			expect(node.position.y).toBe(30);

			node.move({x: 40, y: 50});

			expect(node.position.x).toBe(40);
			expect(node.position.y).toBe(50);
		});

		it('nodes from same line should be at same container', function(){
			var nodeOne = new Node('node-one', line, {x: 20, y:30});
			var nodeTwo = new Node('node-two', line, {x: 30, y:40});

			expect(nodeOne.isFromSameContainer(nodeTwo)).toBe(true);
			expect(nodeTwo.isFromSameContainer(nodeOne)).toBe(true);

			var nodeThree = new Node('node-three', new Line(null, {x: 0, y: 0}), {x: 0, y: 0});

			expect(nodeOne.isFromSameContainer(nodeThree)).toBe(false);
			expect(nodeThree.isFromSameContainer(nodeOne)).toBe(false);
		});

		it('comparing the same node should return true', function() {
			var nodeOne = new Node('node-one', line, {x: 20, y:30});
			expect(nodeOne.equals(nodeOne)).toBe(true);
		});

		it('comparing a node with same value should return true', function() {
			var nodeOne = new Node('node-one', line, {x: 20, y:30});
			var nodeTwo = new Node('node-one', line, {x: 20, y:30});

			expect(nodeOne.equals(nodeTwo)).toBe(true);
			expect(nodeTwo.equals(nodeOne)).toBe(true);
		});


	});
});