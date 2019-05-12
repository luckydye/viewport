import { Cube } from "../../src/geo/Cube";
import Test from "../../src/Test";
import { Vec } from "../../src/Math";
import { Plane } from "../../src/geo/Plane";
import { Pointlight } from "../../src/light/Pointlight";
import DefaultMaterial from "../../src/materials/DefaultMaterial";
import { Sphere } from "../../src/geo/Sphere";
import TestMaterial from "../../src/materials/TestMaterial";
import { Animation } from "../../src/Animation";

const resources = {
    'test_texture': require('../../res/textures/test.png'),
}

Test.viewportTest(resources, viewport => {

    const scene = viewport.scene;

    const lights = [
        new Pointlight({
            position: new Vec(960, 900, 0),
            color: [0, 1, 1],
        }),
        new Pointlight({
            position: new Vec(380, 1200, -830),
            color: [1, 0, 0],
        }),
    ]

    const anim2 = new Animation(lights[0], 'position', 5000, true);
    anim2.setKeyframes([
        new Vec(960, 900, -300),
        new Vec(960, 900, 1000),
        new Vec(960, 900, -300),
    ]);
    viewport.scheduler.addTask(anim2);

    const anim = new Animation(lights[1], 'position', 6000, true);
    anim.setKeyframes([
        new Vec(380, 1200, -830),
        new Vec(380, 200, -830),
        new Vec(380, 1200, -830),
    ]);
    viewport.scheduler.addTask(anim);

    const palneMat = new TestMaterial();
    palneMat.textureScale = 256 * 6;

    scene.add([

        ...lights,

        new Plane({
            material: palneMat,
            scale: 1200,
            rotation: new Vec(-90 / 180 * Math.PI, 0, 0),
        }),

        new Plane({
            material: palneMat,
            scale: 1200,
            rotation: new Vec(90 / 180 * Math.PI, 0, 0),
            position: new Vec(0, 1200 * 2, 0),
        }),

        new Plane({
            material: palneMat,
            scale: 1200,
            rotation: new Vec(0 / 180 * Math.PI, 0, 0),
            position: new Vec(0, 1200, -1200),
        }),

        new Plane({
            material: palneMat,
            scale: 1200,
            rotation: new Vec(180 / 180 * Math.PI, 0, 0),
            position: new Vec(0, 1200, 1200),
        }),

        new Plane({
            material: palneMat,
            scale: 1200,
            rotation: new Vec(0, -90 / 180 * Math.PI, 0),
            position: new Vec(1200, 1200, 0),
        }),

        new Plane({
            material: palneMat,
            scale: 1200,
            rotation: new Vec(0, 90 / 180 * Math.PI, 0),
            position: new Vec(-1200, 1200, 0),
        }),

        new Cube({
            material: new TestMaterial(),
            position: new Vec(200, 200, 200),
            scale: 200
        }),

        new Cube({
            material: new TestMaterial(),
            position: new Vec(1000, 200, 200),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(1000, 600, 600),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(1000, 1000, 1000),
            scale: 200
        }),
        
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-600, 200, -1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-1000, 200, -1000),
            scale: 200
        }),
        
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 200, -1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 600, -1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1000, -1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1400, -1000),
            scale: 200
        }),

        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 200, 1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 600, 1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1000, 1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1400, 1000),
            scale: 200
        }),

        new Cube({
            material: new TestMaterial(),
            position: new Vec(-600, 1400, 1000),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-1000, 1400, 1000),
            scale: 200
        }),

        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1400, 600),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1400, 200),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1400, -200),
            scale: 200
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-200, 1400, -600),
            scale: 200
        }),

        new Sphere({
            material: new TestMaterial(),
            position: new Vec(-600, 650, -200),
            scale: 200,
            id: 80
        }),
    ]);

});