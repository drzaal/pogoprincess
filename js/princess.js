/*
She should have a velocity, she is controlled with directionals,
has a pogo key. That should be enough for now.
*/

var princess = function() {
	this.phaser;
	this.nrml = [0, 1];
	this.state = {
		isHurt: false,
		isLancing: false,
		isPogo: false,
		isSlipping: false	
	};
	this.springY = 0;
	this.springX = 0;
	this.lanceX = 0;
	this.audio = {};
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

		phaser.animations.add('right_idle', [0], 10, true);
		phaser.animations.add('left_idle', [8], 10, true);
		phaser.animations.add('right_idle_lance', [16], 10, true);
		phaser.animations.add('left_idle_lance', [24], 10, true);
		phaser.animations.add('right_crouch', [6], 10, true);
		phaser.animations.add('left_crouch', [14], 10, true);
		phaser.animations.add('right_crouch_lance', [22], 10, true);
		phaser.animations.add('left_crouch_lance', [30], 10, true);
		phaser.animations.add('right', [1,2,3,4,5], 10, true);
		phaser.animations.add('left', [9,10,11,12,13], 10, true);
		phaser.animations.add('right_lance', [17,18,19,20,21], 10, true);
		phaser.animations.add('left_lance', [25,26,27,28,29], 10, true);

	}
	this.update = function() {
		var phaser = self.phaser;
		self.nrml = [ 0, 1 ];
		var is_touching_down = self.touchingDown();


		// Handle the glorious pogo button
		if ( pogoButton.isDown && !self.state.isHurt ) {
			self.state.isPogo = true;
			self.lanceX = 1.1 * phaser.body.velocity.x;
		}
		else {
			self.lanceX = 0;
			self.state.isPogo = false;
			self.state.isLancing = false;	
		}

		if ( self.springX != 0) {
			phaser.body.x += self.springX / Math.abs( self.springX );
			phaser.body.velocity.x += self.springX;
			if ( !is_touching_down && Math.abs(self.springX) > 10 ) {
				self.audio.spring.play();
				phaser.body.velocity.y -= 160;
			}
			self.springX = 0;
			self.state.isLancing = false;
			self.state.isPogo = false;
		}

		if (cursors.down.isDown && is_touching_down) {
			var animation_name = 'crouch';

			if ( phaser.body.velocity.x >= 0 ) {
				animation_name = 'right_' + animation_name;
			}
			else {
				animation_name = 'left_' + animation_name;
			}

			if ( self.state.isPogo ) {
				if ( self.state.isLancing ) {
					phaser.body.velocity.y -= 60 + 0.6 * Math.abs(phaser.body.velocity.x);
					phaser.body.velocity.x *= 1.2;
					self.audio.spring.play();
				}
				else {
					animation_name = animation_name + '_lance';
					self.springY = Math.min( 200 * Math.abs(phaser.body.velocity.x), 450);
				}
			}
			else {
				self.springY = 0;
			}
			phaser.body.velocity.x = frictionSlide ( phaser.body.velocity.x, 0.95, 4 );

			phaser.animations.play(animation_name);
		}
		else if (cursors.left.isDown && is_touching_down)
		{
			//  Move to the left
			if (phaser.body.velocity.x > 0) {
				phaser.body.velocity.x = phaser.body.velocity.x * 0.95;
			}
			else if ( phaser.body.velocity.x == 0) {
				phaser.body.velocity.x = -10;
			}
			phaser.body.force.x = -150 * -self.nrml[1];
			phaser.body.force.y = -800 * (1 + self.nrml[0]);

			if ( self.state.isPogo ) {
				phaser.animations.play('left_lance');

				if ( self.springY > 0 ) {
					phaser.body.velocity.x -= self.springY*0.1;
					phaser.body.velocity.y -= self.springY;
					self.springY = 0;
					self.audio.spring.play();
				}
				else if (Math.abs(phaser.body.velocity.x) > 10) {
					self.state.isLancing = true;
				}
			}
			else {
				phaser.animations.play('left');
			}
		}
		else if (cursors.right.isDown && is_touching_down)
		{
			//  Move to the right
			if (phaser.body.velocity.x < 0) {
				phaser.body.velocity.x = phaser.body.velocity.x * 0.95;
			}
			else if ( phaser.body.velocity.x == 0) {
				phaser.body.velocity.x = 10;
			}
			phaser.body.force.x = 150 * -self.nrml[1];
			phaser.body.force.y = -800 * (1 -self.nrml[0]);

			if ( self.state.isPogo ) {
				phaser.animations.play('right_lance');

				if ( self.springY > 0 ) {
					phaser.body.velocity.x += self.springY*0.1;
					phaser.body.velocity.y -= self.springY;
					self.springY = 0;
					self.audio.spring.play();
				}
				else if (Math.abs(phaser.body.velocity.x) > 10) {
					self.state.isLancing = true;
				}
			}
			else {
				phaser.animations.play('right');
			}
		}
		else
		{
			phaser.body.force.x = 0;
			if ( self.state.isPogo && ! self.state.isHurt && Math.abs(phaser.body.velocity.x) > 10 ) {
				self.state.isLancing = true;
			}
			//  Stand still
			if (is_touching_down) {
				phaser.body.velocity.x = frictionSlide ( phaser.body.velocity.x, 0.999, 4 );
				phaser.body.force.y = -1800 * (Math.abs(self.nrml[0]));

				if ( self.springY > 0 ) {
					phaser.body.velocity.y -= self.springY;
					self.springY = 0;
					self.audio.spring.play();
				}
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
			phaser.body.velocity.y = -200;
			phaser.body.velocity.x *= 1.2;
		}

	}

	this.create();

	this.touchingDown = function() {
		phaser = self.phaser;
		var yAxis = p2.vec2.fromValues(0, 1);
		var xAxis = p2.vec2.fromValues(1, 0);
		var is_footing = false;

		contacts = game.physics.p2.world.narrowphase.contactEquations; 
		var imax = contacts.length;
		for ( var i = 0; i<imax; i++ ) {
			var contact = contacts[i];

			if ( contact.bodyA === phaser.body.data || contact.bodyB === phaser.body.data ) {
				var d = p2.vec2.dot(contact.normalA, yAxis);
				if ( contact.bodyA === phaser.body.data ) { 
					d *= -1;
				}
				if ( d > 0.5 ) { 
					is_footing = true; 
					self.nrml = [ contact.normalA[0] * d, contact.normalA[1] * d ];
				}

				// TODO TAKE THIS OUT OF HERE
				if (Math.abs( p2.vec2.dot(contact.normalA, xAxis)) > 0.7) {
					if ( self.state.isLancing) {
						console.log( phaser.body.velocity );
						self.springX = - self.lanceX;
						self.lanceX = 0;
						self.state.isLancing = false;
					}
				}
			}
		}
		return is_footing;

	}
}
