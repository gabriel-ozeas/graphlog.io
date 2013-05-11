define(['main'], function() {
	describe('Point', function() {
		it('should create a simple point', function() {
			var point = new Point(10, 20);
			expect(point.x).toBe(10);
			expect(point.y).toBe(20);
		});

		it('should compare equal points as equals', function() {
			var pointA = new Point(10, 20);
			var pointB = new Point(10, 20);

			expect(pointA).toEqual(pointB);
			expect(pointB).toEqual(pointA);
		});
	});
});