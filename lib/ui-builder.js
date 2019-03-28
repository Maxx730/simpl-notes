const { ipcRenderer } = require( 'electron' )

module.exports.Build = function( data,callback ) {
    console.log(data)
        let toggles = document.getElementsByClassName('toggle');
        let contents = document.getElementsByClassName('content');
        
        for ( let i = 0;i < toggles.length;i++ ) {
            toggles[i].addEventListener('click',( event ) => {

                for ( let k = 0;k < toggles.length;k++ ) {
                    toggles[k].classList.remove('selected')
                    contents[k].classList.remove('focused')
                }

                if ( !event.target.classList.contains('selected') ) {
                    event.target.classList.add('selected')
                    callback ( event.target.id ) 
                    document.getElementById( event.target.id + '-content' ).classList.add('focused')
                }
            })
        }
        
        document.getElementById('clear-clipboard').addEventListener('click', () => {
            data.clipboard = [];
            ipcRenderer.send( 'save-data',data )
        })
}