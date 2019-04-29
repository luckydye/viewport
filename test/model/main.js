import TestMaterial from "../../src/materials/TestMaterial";
import Test from "../../src/Test";
import { Geometry } from "../../src/scene/Geometry";
import { Resources } from "../../src/Resources";
import { Loader } from "../../src/Loader";
import { Animation } from "../../src/Animation";
import { Pointlight } from "../../src/light/Pointlight";
import { Vec } from "../../src/Math";
import DefaultMaterial from "../../src/materials/DefaultMaterial";

const resources = {
    'desk': require('../../res/models/desk_exploded.obj'),
}

Test.viewportTest(resources, viewport => {

    const scene = viewport.scene;

    viewport.renderer.background = [0.8, 0.9, 1.0, 1.0];

    const meshVerts = Loader.loadObjFile(Resources.get('desk'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: new DefaultMaterial(),
        scale: 50,
        id: 10,
    });
    scene.add(mesh);

    const lights = [
        new Pointlight({
            color: [0, 0.4, 1],
            id: 10,
        }),
        new Pointlight({
            color: [1, 0, 0],
            id: 20,
        }),
    ]

    {
        const anim = new Animation(lights[1], 'position', 10000, true);
        anim.setKeyframes([
            new Vec(550, 903, 197),
            new Vec(450, 903 + 25, 197),
            new Vec(550, 903, 197),
        ]);
        viewport.scheduler.addTask(anim);
    }

    {
        const anim = new Animation(lights[0], 'position', 10000, true);
        anim.setKeyframes([
            new Vec(100, 830, -430),
            new Vec(0, 700, -600),
            new Vec(100, 830, -430),
        ]);
        viewport.scheduler.addTask(anim);
    }

    const anim = new Animation(mesh, 'position', 10000, true);
    anim.setKeyframes([
        new Vec(0, 0, 0),
        new Vec(0, 50, 0),
        new Vec(0, 0, 0),
    ]);
    viewport.scheduler.addTask(anim);

    const anim2 = new Animation(mesh, 'rotation', 10000, true);
    anim2.setKeyframes([
        new Vec(0, 0, 0),
        new Vec(0, 0.15, 0),
        new Vec(0, 0, 0),
    ]);
    viewport.scheduler.addTask(anim2);

    scene.add(lights);

    scene.curosr.hidden = true;

    const camAnim = new Animation(scene.activeCamera, 'position', 10000, true);
    camAnim.setKeyframes([
        new Vec(-660, -440, 580),
        new Vec(-628, -787, 663),
        new Vec(-660, -440, 580),
    ]);
    viewport.scheduler.addTask(camAnim);

    const camAnim2 = new Animation(scene.activeCamera, 'rotation', 10000, true);
    camAnim2.setKeyframes([
        new Vec(0, -2.46, 0),
        new Vec(0.18, -2.42, 0),
        new Vec(0, -2.46, 0),
    ]);
    viewport.scheduler.addTask(camAnim2);
});
