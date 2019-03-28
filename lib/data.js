const filesystem = require('fs')
const DEVMODE = true;

//On first load we want to check if the file exists, if not 
//then we want to create the baseline preferences and data files.
module.exports.CheckForFile =  function ( filename,callback ) {
    try {
        if ( filesystem.existsSync( 'data/' + filename + '.json' ) ) {
            if ( DEVMODE ) {
               console.log( "ATTEMPTING TO LOAD FILE" ) 
            }
            
            filesystem.readFile( 'data/' + filename + '.json',( err,data ) => {
                if ( !err ) {
                    if ( DEVMODE ) {
                        console.log( "SUCCESSFULLY LOADED FILE" ) 
                     }
                    callback( JSON.parse( data ) )
                } else {
                    console.log( err );
                    callback( null )
                }
            });
        } else {
            if ( DEVMODE ) {
                console.log( "CREATING NEW FILE" ) 
            }
            let data = {};

            if ( filename === 'data' ) {
                data = {
                    preferences: {
    
                    },
                    notes:[],
                    clipboard:[]
                }
            }
            //If the file does not exist we want to then create the default template
            //for the file.
            module.exports.CreateFile ( 'data/' + filename + '.json',data,( file ) => {
                callback( file )
            })
        }
    } catch ( err ) {
        if ( DEVMODE ) {
            console.log( "ERROR FINDING FILE" ) 
         }
        return callback( null );
    }
}

module.exports.CreateFile = function ( filename,data,callback ) {
    filesystem.writeFile( filename,JSON.stringify( data ), ( err ) => {
        if ( DEVMODE ) {
            console.log( "FILE CREATED" ) 
        }
        callback ( data )
    })
}

module.exports.FileExists = function ( path ) {
    try {
        if ( filesystem.existsSync ( path ) ) {
            return true;
        } else {
            return false;
        }
    } catch ( err ) {
        return false;
    }
}