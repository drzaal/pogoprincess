/*
She should have a velocity, she is controlled with directionals,
has a pogo key. That should be enough for now.
*/

var princess = function() {
	this.phaser;
	self = this;

	this.create = function () {
		phaser = game.add.sprite( 32, game.world.height - 214, 'princess');
		this.phaser = phaser;
		game.physics.p2.enable(this.phaser);

		phaser.anchor.setTo(0.5, 0.5); // Anchor the center

		game.camera.follow( phaser );

		// this.phaser.body.bounce.y = 0.1;
		// this.phaser.body.gravity.y = 2400;
		// this.phaser.body.collideWorldBounds = true;

		phaser.body.setCircle( 16, 0, 0 );
		phaser.body.fixedRotation=true;

		phaser.animations.add('left', [1,2,3,4,5], 10, true);
		phaser.animations.add('right', [1,2,3,4,5], 10, true);

	}
	this.update = function() {
		var phaser = self.phaser;
		var is_touching_down = self.touchingDown();

		// Handle the glorious pogo button
		if ( pogoButton.isDown ) {
			is_pogo = true;
		}

		if (cursors.left.isDown && is_touching_down)
		{
			//  Move to the left
			if (phaser.body.velocity.x > 0) {
				phaser.body.velocity.x = phaser.body.velocity.x * 0.95;
			}
			phaser.body.force.x = -150;

			phaser.animations.play('left');
		}
		else if (cursors.right.isDown && is_touching_down)
		{
			//  Move to the right
			if (phaser.body.velocity.x < 0) {
				phaser.body.velocity.x = phaser.body.velocity.x * 0.95;
			}
			phaser.body.force.x = 150;

			phaser.animations.play('right');
		}
		else
		{
			phaser.body.force.x = 0;
			//  Stand still
			if (is_touching_down) {
				phaser.body.velocity.x = frictionSlide ( phaser.body.velocity.x, 0.999, 4 );
			}
			else  {
				phaser.body.velocity.x = frictionSlide ( phaser.body.velocity.x, 0.999, 0.5 );
				if (cursors.right.isDown) {
					phaser.body.force.x = 50;
				}
				if (cursors.left.isDown) {
					phaser.body.force.x = -50;
				}
			}
			phaser.animations.stop();

			phaser.frame = 4;
		}

		//  Allow the player to jump if they are touching the ground.
		if (cursors.up.isDown && is_touching_down)
		{
			phaser.body.velocity.y = -350;
		}

	}

	this.create();

	this.touchingDown = function() {
		phaser = self.phaser;
		var yAxis = p2.vec2.fromValues(0, 1);
		var is_collision = false;

		contacts = game.physics.p2.world.narrowphase.contactEquations; 
		var imax = contacts.length;
		for ( var i = 0; i<imax; i++ ) {
			var contact = contacts[i];

			if ( contact.bodyA === phaser.body.data || contact.bodyB === phaser.body.data ) {
				var d = p2.vec2.dot(contact.normalA, yAxis);
				if ( contact.bodyA === phaser.body.data ) { d *= -1; }
				if ( d > 0.5 ) { is_collision = true; }
			}
		}
		return is_collision;

	}
}
