define(['main'], function() {
	describe('NodeLink', function() {
		var nodeOne, nodeTwo, link;

		beforeEach(function() {
			nodeOne = {
				position: {x: 10, y: 10},
				isFromSameContainer: function() {return true}
			};
			nodeTwo = {
				position: {x: 20, y: 20},
				isFromSameContainer: function() {return true}
			};
			nodeOne.container = new Line(null, {x: 0, y:0});
		});

		it("should be able to create a basic Link", function() {
			link = new Link(nodeOne, nodeTwo);
			expect(link.startPoint.x).toBe(10);
			expect(link.startPoint.y).toBe(10);

			expect(link.endPoint.x).toBe(20);
			expect(link.endPoint.y).toBe(20);

			expect(link.dimension.width).toBeCloseTo(14.14, 2);
		});

		it("creating link at the same y position", function() {
			nodeTwo.position.y = 10;

			link = new Link(nodeOne, nodeTwo);
			expect(link.startPoint.x).toBe(10);
			expect(link.startPoint.y).toBe(10);

			expect(link.endPoint.x).toBe(20);
			expect(link.endPoint.y).toBe(10);

			expect(link.dimension.width).toBeCloseTo(10.00, 2);
		});

		it("creating link at the same position", function() {
			nodeTwo.position.x = 10;
			nodeTwo.position.y = 10;

			link = new Link(nodeOne, nodeTwo);
			expect(link.startPoint.x).toBe(10);
			expect(link.startPoint.y).toBe(10);

			expect(link.endPoint.x).toBe(10);
			expect(link.endPoint.y).toBe(10);

			expect(link.dimension.width).toBeCloseTo(0.00, 2);
			expect(link.angle).toBe(0);
		});

		it("should add container width when nodes are from different containers", function() {
			nodeOne.isFromSameContainer = function() {return false};
			nodeOne.getPosition = function() {return {x: 0, y: 200}};

			nodeTwo.container = new Line(null, {x:0, y:200});

			link = new Link(nodeOne, nodeTwo);
			expect(link.startPoint.x).toBe(10);
			expect(link.startPoint.y).toBe(10);

			expect(link.endPoint.x).toBe(20);
			expect(link.endPoint.y).toBe(20);

			expect(link.dimension.width).toBeCloseTo(210.23, 1);
		});
	});	
});

