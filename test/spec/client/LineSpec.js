define(['main'], function() {
	describe('Line', function() {
		it('create basic line container in one position', function() {
			var container = {};

			var line = new Line(container, {x: 30, y: 40});
			expect(line.position.x).toBe(30);
			expect(line.position.y).toBe(40);
			expect(line.container).not.toBe(null);
		});

		it('add one node to the line', function() {
			var line = new Line(null, {x: 30, y: 40});

			line.addNode();

			expect(line.nodes.length).toBe(1);
		});


		it('add new first node should position it in center', function() {

		});

	});
});