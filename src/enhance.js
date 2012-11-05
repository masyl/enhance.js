 /* Author : Mathieu Sylvain - mathieu.sylvain@nurun.com
 * Date : 2010
 * Modified By: Michel Gratton - michel.gratton@nurun.com, michel.gratton@nadrox.com
 * 				Billy Rancourt - billy.rancourt@nurun.com
 * 				Alexandre Paquette - alexandre.paquette@nurun.com, alexandre.paquette@nadrox.com
 * Modified Date : October 13, 2011
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

* October 13, 2011 Update - AP
* Added "elems" attribute of the enhancement object which is an array of the 
* elements where the same data-enhance attribute is applied.
* Also enhanced elements are flagged so the same enchancement is not runned twice
 */

(function($) {
	var hasConsole = typeof console !== "undefined",
		hasConsoleTime = hasConsole && typeof console.time !== "undefined",
		enhancements = [],
		enhancementGroups = {global:[]},
		enhanceCnt = 0, // Use for auto id
		enhOptions = {
			"class" : "enhance", // default className selector 
			"dataHandler" : "enhance" // default data attribute [data-enhance]
		};


	if (!hasConsole){
		console = {assert:function(){},clear:function(){},count:function(){},debug:function(){},dir:function(){},dirxml:function(){},error:function(){},exception:function(){},group:function(){},groupCollapsed:function(){},groupEnd:function(){},info:function(){},log:function(){},memoryProfile:function(){},memoryProfileEnd:function(){},profile:function(){},profileEnd:function(){},table:function(){},time:function(){},timeEnd:function(){},timeStamp:function(){},trace:function(){},warn:function(){}};
	}

	function getGroupeContext(gc) {
		if(typeof gc == "undefined" || gc.length == 0 || gc[0] == "") return false;
		gc = (!$.isArray(gc) ? $.trim(gc).split(/\s+/) : gc);
		if(gc[0] === "*") gc[0] = "global";
		return gc;
	}
	
	function applyEnhancements() {
		var target = this,
			group,
			elems,
			execGroups = {},
			enhs = {};
		
		if (target.hasClass(enhOptions["class"])) {
			elems = target.find(target.find('.'+enhOptions["class"]));
		} else {
			elems = target.find("[data-enhance]");
		}
		elems = elems.add(target);

		$.each(elems, function(index,value) {
			var g, i, eni;
			g = getGroupeContext($(this).data(enhOptions.dataHandler) || "");
			if(g) {
				for(i=0;g[i];i++){
					group = enhancementGroups[g[i]];
					if(typeof group !== "undefined" ) {
						execGroups[g[i]]=g[i];
						for(eni=0;group[eni];eni++) {
							
							if(!enhs[group[eni].id]) {
								enhs[group[eni].id] = group[eni] ;
								//reset previously added elements in global scope
								enhs[group[eni].id].elems = [];
							}
							
							if (!!!$(value).data("enhance-"+ group[eni].id + "-applied")){
								enhs[group[eni].id].elems.push(value);
							}
						}
					}
				}
			}
		});

		/*** DEBUG ***/
		//console.log('enh groups : ', _enG);
		//console.log("enhancements to apply : ");
		//console.dir(enhs);
		/*** END DEBUG ***/

		
		$.each(enhs, function() {
			var id = (this.id !== null) ? "#" + this.id + ": " : "",
				desc = "Enhanced: " + id + this.title;
			if (hasConsoleTime) console.time(desc);
			$(this.elems).data("enhance-"+ this.id + "-applied", true);
			$(this.elems).addClass("enhance-"+ this.id + "-applied");
			this.handler($(this.elems), target);
			try {

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
		this.id = o.id || 'enhancejs-' + (++enhanceCnt);
		this.title = o.title || "";
		var group = o.group || "";
		if (o.id) group = group + " " + o.id;
		this.groups = getGroupeContext(group);
		this.elems = [];//will contain all elements from the group
	}

	function registerEnhancement(handler, _options) {
		if($.isFunction(handler)) {
			var enh = new Enhancement(handler, _options);
			enhancements.push(enh);
			$.each(enh.groups, function() {
				var g = this.toString();
				if(typeof enhancementGroups[g] == "undefined") {
					enhancementGroups[g] = [];
				}
				enhancementGroups[g].push(enh);
			});
		} else {
			enhOptions = $.extend(enhOptions, handler);
		}
	}

	function array_merge(first, second, byVal) {
		if(typeof byVal !== "undefined" && byVal) {
			var i = first.length,
				j = 0;

			if (typeof second.length === "number") {
				for (var l = second.length; j < l; j++ ) {
					if($.inArray(second[j], first) === -1) {
						first[i++] = second[j];
					}
				}
	
			} else {
				while ( second[j] !== undefined ) {
					if($.inArray(second[j], first)===-1) {
						first[ i++ ] = second[ j++ ];
					}
				}
			}
	
			first.length = i;
	
			return first;
		} else {
			return $.merge(first, second);
		}
	}
	// Check if jQuery is loaded
	if ($) {
		$.fn.array_merge = $.array_merge = array_merge;
		$.fn.enhance = applyEnhancements;
		$.enhance = registerEnhancement;
	}
})(jQuery);
