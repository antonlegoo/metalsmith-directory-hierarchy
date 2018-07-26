var _                   = require("lodash");
var defaults            = require("./defaults");

//	*******************************************************
//	#	...
// 		A function to create a new metadata item that
//      turns matching files into a hierarchal object tree 
//		based on their folder structure.
//      The key use-case is for building navigation.
//
//      For example:
//
//      {  
// 			"children" : { 
//              "markdown_filename1" : {
//                  "item": {...} 
//                  "children" : {...}
//                      "markdown_filename2" : { 
//                          "item": {...} 
//                          "children" : {...}
//                      },
//                  },
//                  "markdown_filename3" : {...}
//              }
//              "markdown_filename4" : {...}
//      }
// 		
//	*******************************************************

var organize = function( options )
{	
	// Merge user options with defaults to create settings object
	var settings = _.merge( defaults, options );

    return function(files, metalsmith, done)
    {
    	// Get only the files whose filepath matches the regex in setting's test
    	var filteredFiles = _.filter( files, function(file, name){   return settings.test.test( name );  });

    	// Our return object
        var r = { "children": {} };

        // For each file...
        _.each( filteredFiles, function(item)
        {
            // Split the path by directories into an array
            var pathParts = item.path.href.split( "/" );

            // Last item is the "file.ext" part. Remove it
            pathParts.pop();

            // Skip if wer're left with nothing
            if( pathParts.length == 0 ) return;

            // Is it a root node?
            if( pathParts.length == 1 )
            {
                // Then add it as a root node
                // Make sure an object exists for it
                if( r.children[ pathParts[0] ] == undefined )
                    r.children[ pathParts[0] ] = {};
                // Add it
                r.children[ pathParts[0] ].item = item;
            }
            else
            {
                // Its not.. we'll have to walk the tree

                // Add a "children" object for every item in the path part, e.g.
                //      [ "Features", "children", "feature-1", "children", ... ]
                var newPP = _.chain( pathParts ).map( function(p){ return [ p, "children" ] } ).flatten().value();
                // Add the root "children" to the top of the path
                newPP.unshift( "children" );
                // Remove the last "children", an artifact of the map/chain command above
                newPP.pop();
                // Make this an item
                newPP.push( "item" );
                // Set it
                _.set( r, newPP, item );
            }
        });

        // Add it to the metadata
        metalsmith.metadata()[ settings.name ] = r;

        // Call callback
        done();
    }
};

//	*******************************************************
//	#	Exports
//	*******************************************************

module.exports = organize;
