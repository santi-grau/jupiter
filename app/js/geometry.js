var THREE = require('three');

module.exports = function( self ){
	self.addEventListener('message',function (msg){
		var imgData = msg.data.imgData;
		var texSize = msg.data.texSize;
		var ps = [];
		var geometry = new THREE.BufferGeometry();
		var position = [], color = [], uv = [], puv = [], normal = [];

		for( var i = 0 ; i < texSize ; i++ ){
			var a = [];
			for( var j = 0 ; j < texSize ; j++ ) a.push( imgData[ texSize * j + i ] );
			ps.push( a );
		}

		for( var i = 0 ; i < texSize * texSize ; i++ ){
			
			var iterations = 16;
			var iterationCount = 0;
			var placed = false;

			var uvy, uvx;
			while( !placed ){
				var p = new THREE.Vector3( 1, 0, 0 ).applyAxisAngle ( new THREE.Vector3( 0, 0, 1 ), Math.random() * Math.PI - Math.PI / 2 ).applyAxisAngle ( new THREE.Vector3( 0, 1, 0 ), -Math.random() * Math.PI )
				uvx = 1 - Math.atan2( p.z, p.x ) / Math.PI;
				uvy = 1 - ( p.y + 1 ) / 2;
				
				var pd = ps[ Math.floor( uvx * texSize ) ][ Math.floor( uvy * texSize ) ];

				if( Math.random() < pd / 255 * ( Math.sin( uvy * Math.PI ) ) ) placed = true;
				if( iterationCount == iterations ) placed = true;
				iterationCount++;
			}

			
			puv.push( Math.floor( i / texSize ) / texSize, ( i % texSize ) / texSize );
			uv.push( uvx, uvy );
			position.push( p.x, p.y, p.z );
			color.push( 1, 1, 1, 1 );
			normal.push( p.x, p.y, p.z );
		}
		// console.log( puv )
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( color ), 4 ) );
		geometry.addAttribute( 'puv', new THREE.BufferAttribute( new Float32Array( puv ), 2 ) );
		geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uv ), 2 ) );
		geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normal ), 3 ) );

		self.postMessage( JSON.stringify( { geo : geometry.toJSON() } ) );
	});
}