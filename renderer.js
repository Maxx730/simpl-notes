const { ipcRenderer } = require( 'electron' )
const UiBuilder = require('./lib/ui-builder.js')
const Toast = require('./lib/toast.js')

let data;
let screen = "clipboard";



ipcRenderer.on( 'loaded-data',( event,arg ) => {
    //Once the data has been loaded we can fill out the data however we want in the ui;
    switch ( screen ) {
        case "notes" :
            RenderInputs( arg )
        break;
        case "clipboard":
            RenderClipBoard( arg )
        break;
    }
    
    data = arg;
    UiBuilder.Build( data,( tar ) => {
        screen = tar;
    
        switch ( screen ) {
            case "clipboard":
                RenderClipBoard ( data )
            break;
        }
    } );
})

//Renders all the input lines based on the size of the window.
function RenderInputs ( data ) {
    let list = document.getElementById( 'note-list' );
    let fields = document.getElementsByClassName( 'note-field' );
    let amount = Math.floor(window.innerHeight / fields[0].offsetHeight);
    let output;

    if ( fields.length < amount ) {
        output = list.innerHTML
    } else {
        output = ''
    }

    for ( let i = 0;i < amount;i++ ) {
        let value = '';

        if ( data.notes[i] !== undefined ) {
            value = data.notes[i].title
        }

        output += '<li id = "note-' + i + '" class = "note-field"><input id = "note-input-' + i + '" type = "text" value="' + value + '"/></li>';
    }

    list.innerHTML = output;
    InitInputEvents()
}

function InitInputEvents () {
    let fields = document.getElementsByClassName( 'note-field' );

    for ( let i = 0;i < fields.length;i++ ) {
        fields[i].addEventListener('change', ( event ) => {
            console.log("working")
            let id = event.target.id.split('-')[2]

            data.notes[i] = {
                id: id,
                title: event.target.value,
                body: ""
            }

            ipcRenderer.send( 'save-data',data )
        });
    }
}

function RenderClipBoard ( data ) {
    document.getElementById('clipboard-list').innerHTML = ''
    let items = [];

    for ( let i = data.clipboard.length - 1;i > 0;i-- ) {
        item = document.createElement('LI');
        item.classList.add('clip');
        item.innerText = data.clipboard[i]
        item.addEventListener('click', ( event ) => {
            ipcRenderer.send( 'apply-clipboard',event.target.innerText )
            Toast.ShowToast( 'Saved to Clipboard!',1500 )
        })
        items.push( item )
    }
    
    items.forEach( item => {
        document.getElementById('clipboard-list').appendChild( item )
    })
}

window.onresize = function () {
    if ( screen === "notes" ) {
        //We need to determine how many inputs are already there and 
        //add if it gets bigger.
        RenderInputs( data )        
    }
}