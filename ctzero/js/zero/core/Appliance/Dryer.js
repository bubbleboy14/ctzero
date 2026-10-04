zero.core.Appliance.Dryer = CT.Class({
	CLASSNAME: "zero.core.Appliance.Dryer",
	setPower: function(p) {
		this.power = p;
		if (!p)
			this._on = false;
		this.setMode();
	},
	do: function(order) {
		if (!this.power) return this.log("do(", order, ") aborted - no power!");
		if (order == "toggle")
			this.toggle();
	},
	toggle: function() {
		this._on = !this._on;
		this.setMode();
	},
	// door hinges along its left edge (local x=-22) and swings open 90 degrees around y,
	// same translate+rotate trick zero.core.Appliance.Gate's door sliders use (see its
	// "swing" slider) to keep the hinge edge fixed while the rest of the door sweeps out
	doorTarget: {
		position: { x: -22, z: 52 },
		rotation: { y: -Math.PI / 2 }
	},
	open: function(cb) {
		this.sound("swing");
		this.door.backslide(this.doorTarget, this.simpleBound, cb);
	},
	setMode: function() {
		this.diode.setColor(this.power ? (this._on ? 0x00ff00 : 0xff0000) : 0x000000);
		this.ambience(this.power && this._on ? "dryer" : null);
	},
	preassemble: function() {
		const oz = this.opts, pz = oz.parts, roz = zero.core.current.room.opts;
		pz.push(CT.merge(oz.cabinet, {
			name: "cabinet", // not "body" - that collides with Person.body detection in vu.clix etc.
			boxGeometry: true,
			scale: [60, 70, 60],
			castShadow: roz.shadows,
			receiveShadow: roz.shadows
		}));
		pz.push(CT.merge(oz.door, {
			name: "door",
			boxGeometry: true,
			scale: [44, 50, 4],
			position: [0, 0, 30],
			castShadow: roz.shadows,
			receiveShadow: roz.shadows
		}));
		// drum opening - a flat dark disk sized to sit entirely within the door's closed
		// footprint (44 wide x 50 tall, same x/y center) so it's hidden while closed and
		// revealed once the door swings open, instead of an empty cabinet front
		pz.push(CT.merge(oz.drum, {
			name: "drum",
			circleGeometry: 18,
			position: [0, 0, 30.5],
			material: {
				color: 0x000000,
				shininess: 5
			}
		}));
		// raised back console, like a real dryer's controls - sits on the cabinet top,
		// well clear of the front door below (cabinet top: y=35, back face: z=-30)
		pz.push(CT.merge(oz.console, {
			name: "console",
			boxGeometry: true,
			scale: [56, 14, 16],
			position: [0, 42, -22],
			castShadow: roz.shadows,
			receiveShadow: roz.shadows
		}));
		pz.push(CT.merge(oz.controls, {
			thing: "Panel",
			name: "controls",
			position: [0, 40, -13],
			button: [{
				appliance: this.name, order: "toggle"
			}]
		}));
		pz.push({
			name: "diode",
			intensity: 0.2,
			color: 0xff0000,
			position: [0, 46, -12],
			circuit: this.opts.circuit,
			subclass: zero.core.Appliance.Bulb
		});
	},
	init: function(opts) {
		this.opts = CT.merge(opts, {
			ambon: false,
			ambients: ["dryer"],
			audroot: "zero.core.Appliance"
		}, this.opts);
	}
}, zero.core.Appliance);
