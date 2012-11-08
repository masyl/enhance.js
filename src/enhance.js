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
* November 8, 2012 Update
* -Console log for already enhanced elements 
* -Remove data-enhance for enhanced elements (enhance-***-applied become the only flag to determine if elements hanve already been enhance) so it is easy to remove this class to re-enhance element
* -Grouped log to clean the console
* -Log time and grouped log for ie
* 
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
		},
		timers = {},
		counter = 0,
		errors = 0;
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
				
				var selector = $(elem).prop("tagName") || "",
					id = $(elem).attr("id"),
					classNames = $(elem).attr("class");
				
				if (id) { 
					selector += "#"+ id;
				}
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
								enhs[group[eni].id].groupId = index;
							} else {
								console.log('already applied enhancement', enhs[group[eni].id]); 
							}
							
							if (!!!$(value).data("enhance-"+ group[eni].id + "-applied")){
								enhs[group[eni].id].elems.push(value);
								enhs[group[eni].id].groupId = index;
							} else {
								console.log('already applied enhancement', enhs[group[eni].id]); 
							}
						}
					} else {
						console.warn('No enhancement "' + g + '" found.');
					}
				}
			}
		});

		/*** DEBUG ***/
		//console.log('enh groups : ', _enG);
		//console.log("enhancements to apply : ");
		//console.dir(enhs);
		/*** END DEBUG ***/

		logGroup("--- Enhancement Detail ",null, "start");
		startTimer("--- Enhanced Time");
		
		var index=0,
		groupId = 0;
		
		$.each(enhs, function() {
			var id = (this.id !== null) ? "#" + this.id + ": " : "",
				desc = "Enhanced: " + id + this.title,
				_this= this;
			
			function tryCatch(){
				try {
					
					startTimer(indentForIE+indentForIE+desc);
					
					//$(_this.elems).data("enhance-"+ _this.id + "-applied", true);
					$(_this.elems).addClass("enhance-"+ _this.id + "-applied");
					_this.handler($(_this.elems), target);
					
					counter = counter + 1;
					logTime(indentForIE+indentForIE+desc);
					
				} catch(e) {
					errors = errors+1;
					if (hasConsole){
						console.error("Enhancement failed: " + _this.title);
						console.dir({
							"exception": e,
							"enhancement": _this,
							"target": target
						});
					}
				}
			}
			
			
			if(groupId !== _this.groupId){
				
				logGroup("",null, "end");
				
				groupId = _this.groupId; 
				logGroup(indentForIE+"for element(s) : ",_this.elems, "start");
				
				tryCatch();

			} else {
				if( index === 0 ){
					logGroup(indentForIE+"for element(s) : ",_this.elems, "start");
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
