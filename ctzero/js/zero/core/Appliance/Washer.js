zero.core.Appliance.Washer = CT.Class({
	CLASSNAME: "zero.core.Appliance.Washer",
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
	// lid covers the top in front of the raised back console and hinges along its back edge
	// (local z=-14). Hinge sits 16 units forward of the console's front face (z=-14 -> z=2)
	// rather than just barely clear of it: backslide() animates position.y/z and rotation.x
	// as three independent linear ramps (see Thing.slides()), not a true rotation around a
	// fixed hinge, so mid-swing the hinge point itself wanders off its ideal fixed spot by
	// close to half the lid's depth before snapping back at the endpoints - a small gap gets
	// eaten by that wobble even though both endpoints (closed/open) are individually clear
	// of the diode. Flips up/back 90 degrees around x - derived the same way
	// zero.core.Appliance.Gate's door sliders are: rotate the closed (box-centered) geometry
	// by the target angle, then translate its center so the hinge point lands back where it
	// started - see Gate.js's sliders for the same trick done around y instead of x
	lidTarget: {
		position: { y: 51, z: 2 },
		rotation: { x: -Math.PI / 2 }
	},
	open: function(cb) {
		this.sound("swing");
		this.lid.backslide(this.lidTarget, this.simpleBound, cb);
	},
	setMode: function() {
		this.diode.setColor(this.power ? (this._on ? 0x00ff00 : 0xff0000) : 0x000000);
		this.ambience(this.power && this._on ? "washer" : null);
	},
	setAmbs: function() {
		// base setAmbs() autoplays ambients[0] right away, which would briefly run the
		// washer sound on load since (unlike WaterHeater's whoff/whon pair) there's only
		// one clip here and it means "on" - populate this._audios but let setMode() (via
		// the circuit/power resolution in onready()) decide the real initial state
		zero.core.Thing.prototype.setAmbs.call(this);
		this.ambience(null);
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
		pz.push(CT.merge(oz.lid, {
			name: "lid",
			boxGeometry: true,
			scale: [52, 4, 28],
			position: [0, 37, 16],
			castShadow: roz.shadows,
			receiveShadow: roz.shadows
		}));
		// raised back console, like a real washer's controls - sits on the cabinet top
		// behind the lid (cabinet top: y=35, back face: z=-30)
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
			ambients: ["washer"],
			audroot: "zero.core.Appliance"
		}, this.opts);
	}
}, zero.core.Appliance.Leaker);
