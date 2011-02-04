/*
	Enhance.js

	A javascript library for progressive enhancement

	Usage:
		 // Apply all enhancements to the whole document
		jQuery(document).enhance();

		 // Apply all enhancements to a specific part of the page (after ajax or dhtml)
 		jQuery("#pageSection1").enhance();

		// Register a new enhancement
		jQuery.enhance(function (targets) {
			// some code here...
		}, {
			id: "ajaxPagingBehavior",
			title: "adding ajax behavior on paging"
		});

	Upcomming features:
	- Provide a callback for when enhancement are complete
	- Specify which enhancement to apply by ID
	- Specify which enhancement to apply by Tag/Set
	- Specify a method to test if requirements are met

 */

(function($) {
	var hasConsole = typeof console !== "undefined",
		hasConsoleTime = hasConsole && typeof console.time !== "undefined",
		enhancements = [],
		enhancementsById = {};

	// Check if jQuery is loaded

	function applyEnhancements() {
		var target = this;
		$.each(enhancements, function() {
			var id = (this.id !== null) ? "#" + this.id + ": " : "",
				desc = "Enhanced: " + id + this.title;
			if (hasConsoleTime) console.time(desc);
			try {
				this.handler(target);
			} catch(e) {
				if (hasConsole){
					console.error("Enhancement failed: " + this.title);
					console.dir({
						"exception": e,
						"enhancement": this,
						"target": target
					});
				}
			}
			if (hasConsoleTime) console.timeEnd(desc, this, target);
		});
		return this;
	}

	function Enhancement(handler, _options) {
		this.handler = handler;
		var o = this.option = $.extend({}, _options);
		this.id = o.id || null;
		this.title = o.title || "";
	}

	function registerEnhancement(handler, _options, a, b, c) {
		var enh = new Enhancement(handler, _options);
		enhancements.push(enh);
		if (enh.id) enhancementsById[enh.id] = enh;
	}

	if ($) {
		$.fn.enhance = applyEnhancements;
		$.enhance = registerEnhancement;
	}
})(jQuery);
