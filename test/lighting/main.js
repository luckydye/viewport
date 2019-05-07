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

    const cubes = [
        new Cube({
            material: new TestMaterial(),
            position: new Vec(83, 800, -1610),
            scale: 20,
            id: 10,
        }),
        new Cube({
            position: new Vec(-1440, 450, 1300),
            scale: 5,
            id: 20,
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(1820, 90, 391),
            scale: 10,
            id: 30,
        }),
        new Cube({
            position: new Vec(1080, 76, 1640),
            scale: 8,
            id: 40,
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(0, 300, -1580),
            scale: 30,
            id: 50,
        }),
        new Cube({
            position: new Vec(-1530, 200, 1270),
            scale: 20,
            id: 60,
        }),
        new Cube({
            material: new TestMaterial(),
            position: new Vec(-100, 134, 2400),
            scale: 15,
            id: 70,
        }),
    ];

    const ground = new Plane({
        position: new Vec(0, -0.5, 0),
        material: new DefaultMaterial({ 
            diffuseColor: [0.25, 0.25, 0.25],
        }),
        rotation: new Vec(-90 / 180 * Math.PI, 0, 0),
        scale: 2000
    });

    // const anim3 = new Animation(ground, 'rotation', 10000, true);
    // anim3.setKeyframes([
    //     new Vec(0 / 180 * Math.PI, 0, 0),
    //     new Vec(-360 / 180 * Math.PI, 0, 0),
    // ]);
    // viewport.scheduler.addTask(anim3);

    scene.add([

        ground,

        new Sphere({
            material: new TestMaterial(),
            position: new Vec(0, 650, 0),
            scale: 200,
            id: 80
        }),

        ...lights, 

        ...cubes,
    ]);

});