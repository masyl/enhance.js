 /* Author : Mathieu Sylvain - mathieu.sylvain@nurun.com
  * Date : 2010
  * Modified By: Michel Gratton - michel.gratton@nurun.com, michel.gratton@nadrox.com
  * 			 Billy Rancourt - billy.rancourt@nurun.com
  * 			 Alexandre Paquette - alexandre.paquette@nurun.com, alexandre.paquette@nadrox.com
  *				 Anthony Bucci - anthony.bucci@nurun.com
  * Modified Date : April 24, 2012
  * Version 0.9
  
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
 * 
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
			"isEnhancedFlag" : "isEnhance", // default data attribute [data-enhance]
			"appliedMarkerPrefix" : "isEnhanced-"
		};


	if (!hasConsole){
		console = {assert:function(){},clear:function(){},count:function(){},debug:function(){},dir:function(){},dirxml:function(){},error:function(){},exception:function(){},group:function(){},groupCollapsed:function(){},groupEnd:function(){},info:function(){},log:function(){},memoryProfile:function(){},memoryProfileEnd:function(){},profile:function(){},profileEnd:function(){},table:function(){},time:function(){},timeEnd:function(){},timeStamp:function(){},trace:function(){},warn:function(){}};
	}


	function getGroupeContext(gc) {
		if (typeof gc == "undefined" || gc.length == 0 || gc[0] == "") {
			return false;
		}
		gc = (!$.isArray(gc) ? $.trim(gc).split(/\s+/) : gc);

		if (gc[0] === "*") {
			gc[0] = "global";
		}

		return gc;
	};


	function getTargetElems($target) {
		var elems;

		// Check if the target or one of its decendents has the enhance trigger class
		// Ex: in $(document).enhance(); "$(document)" is the target.
		if ($target.hasClass(enhOptions["class"])) {
			elems = $target;
			elems.add($target.find('.' + enhOptions["class"]));
		} else {
			elems = $target.find('.' + enhOptions["class"]);
		}

		return elems;
	}


	// TODO: Further refactoring needed
	function applyEnhancements() {
		
		var target = this,
			_enhancementGroups = enhancementGroups,
			elems,
			enhancementList = {};
		
		// get list of elements with enhancements
		elems = getTargetElems(target);


		// Determine enhancements to be applied (below), skip elements with enhancement already applied
		$.each(elems, function(index, curElem) {

			var groups, i, j;

			// read data attribute on the element and get list (of the groups) of enhancements to apply
			groups = getGroupeContext($(this).data(enhOptions.dataHandler) || "");

			// skip if already enhanced
			if (!$(curElem).data(enhOptions.isEnhancedFlag) === true) {

				if (groups) {

					$(curElem).data(enhOptions.isEnhancedFlag, true);
					for (i = 0; groups[i]; i++) {

						if (typeof _enhancementGroups[groups[i]] !== "undefined" ) {

							// TODO: clarify this
							for (j = 0; _enhancementGroups[groups[i]][j]; j++) {

								if (!enhancementList[ _enhancementGroups[groups[i]][j].id ]) {
									 enhancementList[ _enhancementGroups[groups[i]][j].id ] = _enhancementGroups[groups[i]][j];
									//reset previously added elements in global scope
									enhancementList[ _enhancementGroups[groups[i]][j].id ].elems = [];
								}

								if (!!!$(curElem).data(enhOptions["appliedMarkerPrefix"] + _enhancementGroups[groups[i]][j].id)){
									enhancementList[_enhancementGroups[groups[i]][j].id].elems.push(curElem);
								}

							}

						} else {
							console.warn('No enhancement "' + groups[i] + '" found.');
						}

					}

				} else {
					console.warn('No enhancement specified on', $(this));
				}

			} else {
				// TODO: Refactor. At this point it is assumed the enhancement code below worked and successfully applied the enhancements.
				console.info('Skipped: already enhanced.');
			}
		});


		/* Apply enhancements */				
		$.each(enhancementList, function() {
		
			var id = (this.id !== null) ? "#" + this.id + ": " : "",
				desc = "Enhanced: " + id + this.title;

			try {

				/* Start timing enhancement*/
				if (hasConsoleTime) {
					console.time(desc)
				};

				$(this.elems).data(enhOptions["appliedMarkerPrefix"] + this.id, true);
				$(this.elems).addClass(enhOptions["appliedMarkerPrefix"] + this.id);

				this.handler(target);

				if (hasConsoleTime) {
					console.timeEnd(desc, this, target)
				};

			} catch(e) {
				if (hasConsole) {
					console.error("Enhancement failed: " + this.title);
					console.dir({
						"exception": e,
						"enhancement": this,
						"target": target
					});
				}
			}


		});
		return this;
	}

	function Enhancement(handler, _options) {
		var _opts = this.option = $.extend({}, _options);
		this.handler = handler;
		this.id = _opts.id || '__jenhance_id_'+(++enhanceCnt)+'__';
		this.title = _opts.title || "";
		this.groups = getGroupeContext(_opts.group);
		this.elems = []; //will contain all elements from the group
	}


	function registerEnhancement(handler, _options) {

		if ($.isFunction(handler)) {
			var enh = new Enhancement(handler, _options);
			enhancements.push(enh);
			enhancementsById[enh.id] = enh;

			$.each(enh.groups, function() {
				var group = this.toString();
				if(typeof enhancementGroups[group] === "undefined") {
					enhancementGroups[group] = [];
				}
				enhancementGroups[group].push(enh);
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
