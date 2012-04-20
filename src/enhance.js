 /* Author : Mathieu Sylvain - mathieu.sylvain@nurun.com
 * Date : 2010
 * Modified By: Michel Gratton - michel.gratton@nurun.com, michel.gratton@nadrox.com
 * 				Billy Rancourt - billy.rancourt@nurun.com
 * 				Alexandre Paquette - alexandre.paquette@nurun.com, alexandre.paquette@nadrox.com
 *				Anthony Bucci - anthony.bucci@nurun.com
 * Modified Date : April 20, 2012
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
			title: "adding ajax behavior on paging",
			group: "ajaxEnhancements"
		});

	Upcomming features:
	- Provide a callback for when enhancement are complete
	- Specify which enhancement to apply by ID
	- Specify which enhancement to apply by Tag/Set
	- Specify a method to test if requirements are met

* October 13, 2011 Update - AP
* Added "elems" attribute of the enhancement object which is an array of the 
* elements where the same data-enhance attribute is applied.
* Also enhanced elements are flagged so the same enchancement is not run twice (modified the flag)
*
* April 20, 2012 Update - AB
* changed flag for applied enhancements
* some refactoring
* added some documentation
 */

(function($) {
	var hasConsole = typeof console !== "undefined",
		hasConsoleTime = hasConsole && typeof console.time !== "undefined",
		enhancements = [],
		enhancementsById = {},
		enhancementGroups = {global:[]},
		enhanceCnt = 0, // Use for auto id
		enhOptions = {
			"class" : "enhance", // default className selector 
			"dataHandler" : "enhance", // default data attribute [data-enhance]
			"appliedMarkerPrefix" : "isEnhanced-"
		};


	if (!hasConsole){
		console = {assert:function(){},clear:function(){},count:function(){},debug:function(){},dir:function(){},dirxml:function(){},error:function(){},exception:function(){},group:function(){},groupCollapsed:function(){},groupEnd:function(){},info:function(){},log:function(){},memoryProfile:function(){},memoryProfileEnd:function(){},profile:function(){},profileEnd:function(){},table:function(){},time:function(){},timeEnd:function(){},timeStamp:function(){},trace:function(){},warn:function(){}};
	}
	function getGroupeContext(gc) {
		if(typeof gc == "undefined" || gc.length == 0 || gc[0] == "") return false;
		gc = (!$.isArray(gc) ? $.trim(gc).split(/\s+/) : gc);
		if(gc[0] === "*") gc[0] = "global";
		return gc;
	};
	
	function applyEnhancements() {
		
		var target = this,
			_enG = enhancementGroups,
			elems,
			execGroups = {},
			enhs = {};
		
		// Check if the target or one of its decendents has the enhance trigger class
		// Ex: in $(document).enhance(); "$(document)" is the target.
		if (target.hasClass(enhOptions["class"])) {
			elems = target;
			elems.add(target.find('.'+enhOptions["class"]));
		} else {
			elems = target.find('.'+enhOptions["class"]);
		}

		$.each(elems, function(index, value) {
			var g, i, eni;
			g = getGroupeContext($(this).data(enhOptions.dataHandler) || "");

			if (g) {
				console.log('g:', g);

				for(i=0; g[i]; i++){

					if(typeof _enG[g[i]] !== "undefined" ) {
						execGroups[g[i]]=g[i];

						for (eni=0; _enG[g[i]][eni]; eni++) {
							
							if(!enhs[ _enG[g[i]][eni].id ]) {
								enhs[ _enG[g[i]][eni].id ] = _enG[g[i]][eni] ;
								//reset previously added elements in global scope
								enhs[ _enG[g[i]][eni].id ].elems = [];
//								console.log('a', _enG[g[i]][eni].id);
							}
							
							if (!!!$(value).data(enhOptions["appliedMarkerPrefix"] + _enG[g[i]][eni].id)){
								enhs[_enG[g[i]][eni].id].elems.push(value);
//								console.log('b', _enG[g[i]][eni].id);
							}
						}
					} else {
						console.log('No enhancement "' + g[i] + '"  found.', $(this));
					}
				}
			} else {
				console.log('No enhancement specified.', $(this));
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

			if (hasConsoleTime) { console.time(desc) };
			try {
				$(this.elems).data(enhOptions["appliedMarkerPrefix"] + this.id, true);
				$(this.elems).addClass(enhOptions["appliedMarkerPrefix"] + this.id);
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
			if (hasConsoleTime) { console.timeEnd(desc, this, target) };
		});
		return this;
	}

	function Enhancement(handler, _options) {
		this.handler = handler;
		var o = this.option = $.extend({}, _options);
		this.id = o.id || '__jenhance_id_'+(++enhanceCnt)+'__';
		this.title = o.title || "";
		this.groups = getGroupeContext(o.group);
		this.elems = [];//will contain all elements from the group
	}

	function registerEnhancement(handler, _options) {
		if($.isFunction(handler)) {
			var enh = new Enhancement(handler, _options);
			enhancements.push(enh);
			enhancementsById[enh.id] = enh;
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
