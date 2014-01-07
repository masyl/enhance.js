
#Enhance.js

Enhance.js is a lightweight javascript utility that helps you organize your code to take advantages of the progressive enhancement approach.

By using enhance.js you gain:
- Better code structure and readability
- Re-apply all enhancements to new page content (ajax/dhtml)
- Automatic logging and timing for optimization
- Failed enhancement cant break the whole site
- Failures are logged appropriatly for debugging
Also Contain:
- Ready to use with AMD --> RequireJs
- Ready to be use with QUnit testing if QUnit script is added to the page.

##Usage:

###Apply all enhancements to the whole document
####HTML:
```sh
<div class="enhance" data-enhance="init">
    <div class="enhance" data-enhance="map"></div>
</div>

<div class="enhance" data-enhance="otherWidget"></div>

<div class="enhance" data-enhance="test"></div>

```
####Javascript:
```sh
    $.enhance(Function.init, { id: "init", title: "Init flags"});
    $.enhance(Widgets.map, { id: "map", title: "Map Initialisation"});
    $.enhance(Widgets.otherWidget, { id: "otherWidget", title: "otherWidget on homepage", options: {}});
    $.enhance(Widgets.otherWidget, { id: "otherWidget", title: "otherWidget on homepage", });
    $.enhance(Widgets.test1, { group: "test", title: "test1"});
    $.enhance(Widgets.test2, { group: "test", title: "test2"});
    $(document).enhance();
```
###Apply all enhancements to a specific part of the page (after ajax or dhtml)
```sh
    jQuery("#pageSection1").enhance();
```
###Register a new enhancement by id
```sh
    jQuery.enhance(function (targets) {
        // some code here...
    }, {
        id: "ajaxPagingBehavior",
        title: "adding ajax behavior on paging"
    });
```
###Register a new enhancement by group
```sh
    jQuery.enhance(function (targets) {
        var options = this.option.options;
        $(target).each(
            $(this).doSomething(options);
        );
    }, {
        title: "adding ajax behavior on paging"
        group: "ajax"
        options: { variable : "test" }
    });
```
###Clear Enhancement for this element
```sh
    jQuery("#element").clearEnhance();
```



Author : Mathieu Sylvain - mathieu.sylvain@nurun.com
* Date : 2010
* Modified By: Michel Gratton - michel.gratton@nurun.com, michel.gratton@nadrox.com
* 				Billy Rancourt - billy.rancourt@nurun.com
* 				Alexandre Paquette - alexandre.paquette@nurun.com, alexandre.paquette@nadrox.com
*				Anthony Bucci - anthony.bucci@nurun.com
* 				Etienne Dion - etienne.dion@nurun.com
* Last Update : January 6, 2014

Upcomming features:
- Provide a callback for when enhancement are complete
- Specify a method to test if requirements are met

Updated:
* October 13, 2011 Update - AP
* Added "elems" attribute of the enhancement object which is an array of the 
* elements where the same data-enhance attribute is applied.
* Also enhanced elements are flagged so the same enchancement is not runned twice
*  
* November 8, 2012 Update - ED
* -Clear Enhancement
* -Console log for already enhanced elements 
* -Remove data-enhance for enhanced elements (enhance-***-applied become the only flag to determine if elements hanve already been enhance) so it is easy to remove this class to re-enhance element
* -Grouped log to clean the console
* -Log time and grouped log for ie
* 
* September 9, 2013 Update - ED
* - Add Support for AMD / Require.js
* January 6, 2014 Update - ED
* - Add Support for QUnit 


Note : To use QUnit and Required see : https://github.com/samastur/mjp/commit/9502d76582ac5a5288cf5b5408499c5ede142b1c