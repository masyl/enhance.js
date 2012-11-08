/* 
* Author : Mathieu Sylvain - mathieu.sylvain@nurun.com
* Date : 2010
* Modified By: Michel Gratton - michel.gratton@nurun.com, michel.gratton@nadrox.com
* 				Billy Rancourt - billy.rancourt@nurun.com
* 				Alexandre Paquette - alexandre.paquette@nurun.com, alexandre.paquette@nadrox.com
*				Anthony Bucci - anthony.bucci@nurun.com
* 				Etienne Dion - etienne.dion@nurun.com
*
* Modified Date : November 7, 2012
	Enhance.js

	A javascript library for progressive enhancement

	Usage:
		 // Apply all enhancements to the whole document
		jQuery(document).enhance();

		 // Apply all enhancements to a specific part of the page (after ajax or dhtml)
 		jQuery("#pageSection1").enhance();

		// Register a new enhancement by id
		jQuery.enhance(function (targets) {
			// some code here...
		}, {
			id: "ajaxPagingBehavior",
			title: "adding ajax behavior on paging"
		});

		// Register a new enhancement by group
		jQuery.enhance(function (targets) {
			// some code here...
		}, {
			id: "ajaxPagingBehavior",
			title: "adding ajax behavior on paging"
			group: "ajax"
		});


Upcomming features:
- Provide a callback for when enhancement are complete
- Specify a method to test if requirements are met

* October 13, 2011 Update - AP
* Added "elems" attribute of the enhancement object which is an array of the 
* elements where the same data-enhance attribute is applied.
* Also enhanced elements are flagged so the same enchancement is not runned twice
*  
* November 7, 2012 Update
* -enhancing by group or | and by id
* -Prevent rehancement on already enhanced elements
* -Console log for already enhanced elements 
* -Option to change the 'enhance' class name to prevent conflict with other enhancing tools
* -grouped log to clean the console
* -Fix on the lost of context for the element enhanced
* -Refactoring
*
*/

(function($) { 
	var hasConsole = typeof console !== "undefined",
		hasConsoleTime = hasConsole && typeof console.time !== "undefined",
		enhancements = [],
		enhancementsById = {},
		enhancementGroups = {global:[]},
		enhanceCnt = 0, // Use for auto id
		counter = 0,
		errors = 0,
		timers = {},
		enhOptions = {
			"class" : "enhance", // default className selector 
			"dataHandler" : "enhance", // default data attribute [data-enhance]
			"isEnhancedFlag" : "isEnhance", // default data attribute [data-enhance]
			"appliedMarkerPrefix" : "isEnhanced-"
		},
		indentForIE = "";

	if(!hasConsoleTime){
		indentForIE = "      ";
	}
	if (!hasConsole){
		console = {assert:function(){},clear:function(){},count:function(){},debug:function(){},dir:function(){},dirxml:function(){},error:function(){},exception:function(){},group:function(){},groupCollapsed:function(){},groupEnd:function(){},info:function(){},log:function(){},memoryProfile:function(){},memoryProfileEnd:function(){},profile:function(){},profileEnd:function(){},table:function(){},time:function(){},timeEnd:function(){},timeStamp:function(){},trace:function(){},warn:function(){}};
	}
	
	
	function logGroup(group, elem, status){
		elem = elem || "";
		if(hasConsoleTime){
			if(status === "start"){
				console.groupCollapsed(group, elem);
			} else {
				console.groupEnd();
			}
			
		} else {
			if(status === "start"){
				
				var selector = $(elem).prop("tagName") || "";
				
				
				var id = $(elem).attr("id");
				if (id) { 
					selector += "#"+ id;
				}

				var classNames = $(elem).attr("class");
				if (classNames) {
					selector += "." + $.trim(classNames).replace(/\s/gi, ".");
				}
				
				console.log(group, selector);
			}
		}
	};

	function startTimer(id) {
		function instance(id){
			this.id = id;
			var date = new Date;
			this.start = date.getTime();
		}
		if(hasConsoleTime){
			console.time(id);
		} else {
			timers[id] = [];
			var timerInstance = new instance(id);
			timers[id].push(timerInstance);
		}
		
	}
	
	function time(id){
		var date = new Date;
		var end = date.getTime();
		var time =  end - timers[id][0].start;
	
		return time;
	}
	function logTime(id){
		if(hasConsoleTime){
			console.timeEnd(id);  
		} else {
			 console.log(id +" : "+time(id)+"ms");
		}
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

									enhancementList[ _enhancementGroups[groups[i]][j].id ].groupByElem = index;

								} else { 
									console.log('already applied enhancement', _enhancementGroups[groups[i]][j].id); 
								}

								if (!!!$(curElem).data(enhOptions["appliedMarkerPrefix"] + _enhancementGroups[groups[i]][j].id)){
									enhancementList[_enhancementGroups[groups[i]][j].id].elems.push(curElem);
									enhancementList[_enhancementGroups[groups[i]][j].id ].groupByElem = index;
								}


							}

						} else {
							if (enhancementsById[groups[i]]){
								enhancementsById[groups[i]].groups = [ "nogroup_" +i ];

								_enhancementGroups[enhancementsById[groups[i]].group] = enhancementsById[groups[i]];

								enhancementList[ _enhancementGroups[enhancementsById[groups[i]].group] ] = _enhancementGroups[enhancementsById[groups[i]].group];

								if (!!!$(curElem).data(enhOptions["appliedMarkerPrefix"] + _enhancementGroups[enhancementsById[groups[i]].group].id)){
									_enhancementGroups[enhancementsById[groups[i]].group].elems.push(curElem);
								}
								_enhancementGroups[enhancementsById[groups[i]].group].groupByElem = index;
							} else {
								console.warn('No enhancement "' + groups[i] + '" found.');
							}


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

		logGroup("--- Enhancement Detail ",null, "start");
		startTimer("--- Enhanced Time");
		
		var index=0,
		groupId = 0;
		/* Apply enhancements */				
		$.each(enhancementList, function() {

			var xthis= this, 
				id = (xthis.id !== null) ? "#" + xthis.id + ": " : "",
				desc = "Enhanced: " + id + xthis.title;

			function tryCatch(){
				try {

					/* Start timing enhancement*/
					startTimer(indentForIE+indentForIE+desc);
					
					$(xthis.elems).data(enhOptions["appliedMarkerPrefix"] + xthis.id, true);
					$(xthis.elems).addClass(enhOptions["appliedMarkerPrefix"] + xthis.id);

					xthis.handler(target);
					
					logTime(indentForIE+indentForIE+desc);
					
					counter = counter + 1;

				} catch(e) {
					errors = errors+1;
					if (hasConsole) {
						console.error("Enhancement failed: " + xthis.title);
						console.dir({
							"exception": e,
							"enhancement": xthis,
							"target": target
						});
					}
				}
			}
			
			
			if(groupId !== xthis.groupByElem){
				
				logGroup("",null, "end");
				
				groupId = xthis.groupByElem; 
				logGroup(indentForIE+"for element(s) : ",xthis.elems, "start");
				
				tryCatch();

			} else {
				if( index === 0 ){
					logGroup(indentForIE+"for element(s) : ",xthis.elems, "start");
				}
				tryCatch();
			}

			index= index+1;

			
			
		});
		
		logGroup("",null, "end");
		logGroup("",null, "end");
		console.log("--- Nb of elements enhanced :", counter, "; Nb of errors :", errors);
		
		logTime("--- Enhanced Time");
		counter =0;
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