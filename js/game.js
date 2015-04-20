
var platforms;
var map;
var cursors;
var pogoButton;

var game = new Phaser.Game( 800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
	// game.load.image( 'princess', 'assets/princess.png' );
	game.load.spritesheet( 'tiles_castle', 'assets/tiles_castle.png', 16, 16 );
	// game.load.image( 'tiles_garden', 'assets/tiles_garden.png' );
	game.load.spritesheet( 'princess', 'assets/princess.png',32,32 );
	game.load.image('load_screen', 'assets/dreaming.jpg');
	game.load.image('sky', 'assets/sky.png');
	game.load.image('ground', 'assets/ground.png');
	game.load.tilemap('level_01', 'assets/level_01.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.audio('spring', 'assets/boing.ogg');
}

function create() {
	// game.add.sprite( 0, 0, 'load_screen' );
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.gravity.y = 1200;

	game.add.sprite(0, 0, 'sky');

	platforms = game.add.group();

	map = game.add.tilemap('level_01');
	map.addTilesetImage('tiles_castle','tiles_castle');

	layer = map.createLayer('solids');
	layer2 = map.createLayer('slopes');

	princess_material = game.physics.p2.createMaterial('princess');
	castle_material = game.physics.p2.createMaterial('stone');

	princess_on_castle = game.physics.p2.createContactMaterial( princess_material, castle_material );

    princess_on_castle.friction = 0.6;     // Friction to use in the contact of these two materials.
    princess_on_castle.restitution = 0.01;  // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
    princess_on_castle.stiffness = 1e6;    // Stiffness of the resulting ContactEquation that this ContactMaterial generate.
    princess_on_castle.relaxation = 4;     // Relaxation of the resulting ContactEquation that this ContactMaterial generate.
    princess_on_castle.frictionStiffness = 1e6;    // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
    princess_on_castle.frictionRelaxation = 4;     // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
    princess_on_castle.surfaceVelocity = 0.0;  


	layer.resizeWorld();
	map.setCollision([1,2,4,5,12,13,14,15,16,20,21], true);

	(function ( barry ) {
		barry.map(function( b ){
			// b.setMaterial( castle_material );
		});
	})( game.physics.p2.convertTilemap( map, layer ));

	layer_slopes = game.physics.p2.convertCollisionObjects(map,"slopes");
	layer_slopes[0].setMaterial( castle_material );
	
	player = new princess();
	player.audio.spring = game.add.audio('spring');
	player.phaser.body.setMaterial( princess_material );

	cursors = game.input.keyboard.createCursorKeys();

    pogoButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}


function update() {

	player.update();
}


function frictionSlide( v, b, w ) {
	if (v == 0) { return 0; }
	else if ( v > 0 ) { f_w = w }
	else if ( v < 0 ) { f_w = -w }

	if ( Math.abs(f_w) >= Math.abs(v) ) { return 0; }

	else return ( v - f_w );
}

function magnitudeXY( v ) {
	return ( v.x * v.x ) + ( v.y * v.y );
}
