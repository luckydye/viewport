import { Cube } from "../../src/geo/Cube";
import Test from "../../src/Test";
import { Vec } from "../../src/Math";
import { Plane } from "../../src/geo/Plane";
import { PointLight } from "../../src/light/PointLight";
import DefaultMaterial from "../../src/materials/DefaultMaterial";
import { Sphere } from "../../src/geo/Sphere";
import TestMaterial from "../../src/materials/TestMaterial";
import { Animation, Keyframe } from "../../src/Animation";

const resources = {
    'test_texture': require('../../res/textures/test.png'),
}

Test.viewportTest(resources, viewport => {

    const scene = viewport.scene;

    const lights = [
        new PointLight({
            position: new Vec(960, 900, 0),
            color: [1, 0, 0],
        }),
        new PointLight({
            position: new Vec(380, 1200, -830),
            color: [0, 1, 0],
        }),
        new PointLight({
            position: new Vec(-380, 1200, 830),
            color: [0, 0, 1],
        }),
    ]

    const anim3 = new Animation(lights[2], 'position', 1000, true);
    anim3.setKeyframes([
        new Vec(-1000, 1800, 1030),
        new Vec(-380, 1000, 600),
        new Vec(-1000, 1800, 1030),
    ]);
    viewport.scheduler.addTask(anim3);

    const anim = new Animation(lights[1], 'position', 2000, true);
    anim.setKeyframes([
        new Vec(380, 1200, -830),
        new Vec(380, 200, -830),
        new Vec(380, 1200, -830),
    ]);
    viewport.scheduler.addTask(anim);

    const anim2 = new Animation(lights[0], 'position', 1000, true);
    anim2.setKeyframes([
        new Vec(960, 900, -300),
        new Vec(960, 900, 1000),
        new Vec(960, 900, -300),
    ]);
    viewport.scheduler.addTask(anim2);

    const cubes = [
        new Cube({
            position: new Vec(200, 800, 150),
            material: new DefaultMaterial(),
            scale: 20,
            id: 10
        }),
        new Cube({
            position: new Vec(-150, 650, 160),
            material: new DefaultMaterial(),
            scale: 5,
            id: 20
        }),
        new Cube({
            position: new Vec(-30, 700, -180),
            material: new DefaultMaterial(),
            scale: 10,
            id: 30
        }),
        new Cube({
            position: new Vec(-400, 1080, -180),
            material: new DefaultMaterial(),
            scale: 8,
            id: 40
        }),
        new Cube({
            position: new Vec(0, 300, 0),
            material: new DefaultMaterial(),
            scale: 30,
            id: 50
        }),
        new Cube({
            position: new Vec(-400, 800, -200),
            material: new DefaultMaterial(),
            scale: 20,
            id: 60
        }),
        new Cube({
            position: new Vec(-100, 1150, 0),
            material: new DefaultMaterial(),
            scale: 15,
            id: 70
        }),
    ];

    scene.add([

        new Plane({
            position: new Vec(0, -0.5, 0),
            material: new DefaultMaterial({ 
                diffuseColor: [0.25, 0.25, 0.25],
                specular: 0
            }),
            rotation: new Vec(-90 / 180 * Math.PI, 0, 0),
            scale: 20000
        }),

        new Sphere({
            material: new TestMaterial(),
            position: new Vec(200, 700, -200),
            scale: 100,
            id: 80
        }),

        ...lights, 

        ...cubes,
    ]);

});