

(function($){

	function move(_elem) {
		var elem = _elem;
		elem
			.animate({
				"padding-left": "3em"
			}, 200)
			.animate({
				"padding-left": "0em"
			}, 800., function () {
				move(elem);
			})
	};

	function enhancementIsMoving(target) {
		$(target).find(".isMoving").each(function() {
			var elem = $(this);
			if (!elem.is(".isAlreadyMoving")) {
				elem
					.addClass("isAlreadyMoving")
					.css({
						"position": "relative"
					});
				move(elem);
			}
		});
	}

	$.enhance(enhancementIsMoving, {
		id: "isMoving",
		title: "adding some nice movement"
	});

	$(function() {
		// Trigger the main enhancement loop on document ready
		$(document).enhance();
		// Run enhancements again for the newly added content
		$("#btnAddContent").click(function() {
			$("#newContent")
				.append($("#sampleContent").html())
				.enhance();
		});
	});


})(jQuery);