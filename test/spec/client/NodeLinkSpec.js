define(['main'], function() {
	describe('NodeLink', function() {
		var nodeOne, nodeTwo, link, containerA, containerB;

		beforeEach(function() {
			containerA = new Line(null, {x: 0, y: 0});

			nodeOne = new Node (containerA, {x: 10, y: 10});
			nodeTwo = new Node (containerA, {x: 20, y: 20});
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

		it("should move link when nodes change position", function() {
			link = nodeOne.linkWith(nodeTwo);

			expect(link.startPoint.x).toBe(10);
			expect(link.startPoint.y).toBe(10);

			expect(link.endPoint.x).toBe(20);
			expect(link.endPoint.y).toBe(20);

			expect(link.dimension.width).toBeCloseTo(14.14, 2);

			nodeOne.move({x: 5, y:5});

			expect(link.startPoint.x).toBe(5);
			expect(link.startPoint.y).toBe(5);

			expect(link.dimension.width).toBeCloseTo(21.21, 2);			
		});

		it("should compare to links correctly", function() {
			var linkB = new Link(nodeOne, nodeTwo);

			expect(link).toEqual(linkB);
			expect(linkB).toEqual(link);
		});
	});	
});

