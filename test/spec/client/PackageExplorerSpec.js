define(['main'], function() {
	describe('PackageExplorer', function() {
		it('should display list item for one empty package', function() {
			var packages = {name: 'io.graphlog', subs: []};

			var item = new PackageExplorerItem(packages);

			expect(item.element).toContain('span.tree-empty');
			expect(item.element).toContain('span.empty-package');
		});

		it('should display list itens for empty two packages', function() {
			var packages = {name: 'io.graphlog', subs: [
					{name: 'transaction', subs:[]}
				]};

			var item = new PackageExplorerItem(packages);
			console.log(item.element.html());
		});
	});
});